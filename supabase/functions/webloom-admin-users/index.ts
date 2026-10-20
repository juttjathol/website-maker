import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

type ActionBody = {
  action?:
    | "create_customer"
    | "reset_customer_password"
    | "complete_first_password_change"
    | "request_subscription"
    | "list_subscription_requests"
    | "set_subscription_request_status"
    | "set_user_plan";
  email?: string;
  name?: string;
  userId?: string;
  newPassword?: string;
  message?: string;
  requestId?: number;
  status?: string;
  plan?: string;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function temporaryPassword() {
  // Returned to an authenticated administrator once; never log or persist it.
  return `${crypto.randomUUID().replaceAll("-", "")}K7!`;
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const bearer = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)
    ?.[1];
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return json(500, { error: "Supabase function environment is incomplete." });
  }
  if (!bearer) return json(401, { error: "Sign in to continue." });

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: `Bearer ${bearer}` } },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const { data: authResult, error: authError } = await userClient.auth.getUser(
    bearer,
  );
  const caller = authResult.user;
  if (authError || !caller) {
    return json(401, { error: "Your session has expired. Sign in again." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  let body: ActionBody;
  try {
    body = await request.json() as ActionBody;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  if (body.action === "complete_first_password_change") {
    const nextPassword = body.newPassword || "";
    if (nextPassword.length < 12 || nextPassword.length > 128) {
      return json(400, {
        error: "Choose a password between 12 and 128 characters.",
      });
    }

    const mustChange =
      caller.app_metadata?.webloom_must_change_password === true;
    if (!mustChange) {
      return json(400, {
        error: "There is no required password setup for this account.",
      });
    }

    const appMetadata = {
      ...caller.app_metadata,
      webloom_must_change_password: false,
    };
    const { error: passwordError } = await adminClient.auth.admin
      .updateUserById(caller.id, {
        password: nextPassword,
        app_metadata: appMetadata,
      });
    if (passwordError) return json(400, { error: passwordError.message });

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", caller.id);
    if (profileError) {
      console.error(
        "Unable to clear first-login password flag",
        profileError.message,
      );
      return json(500, {
        error:
          "Your password was changed, but the account setup flag could not be cleared. Contact Webloom support.",
      });
    }

    return json(200, { ok: true });
  }

  // Any signed-in customer may ask for a Pro subscription. The request is
  // tied to their verified account email so staff can contact them.
  if (body.action === "request_subscription") {
    const message = String(body.message || "").trim().slice(0, 500);
    if (!caller.email) {
      return json(400, { error: "Your account does not have an email address." });
    }
    const { error: requestError } = await adminClient
      .from("subscription_requests")
      .insert({ user_id: caller.id, email: caller.email, message, status: "pending" });
    if (requestError) {
      console.error("Unable to record subscription request", requestError.message);
      return json(500, { error: "The subscription request could not be saved. Please try again." });
    }
    return json(201, { ok: true });
  }

  const { data: adminRecord, error: adminLookupError } = await adminClient
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", caller.id)
    .maybeSingle();
  const { data: adminProfile, error: adminProfileError } = await adminClient
    .from("profiles")
    .select("suspended_at,must_change_password")
    .eq("id", caller.id)
    .maybeSingle();
  if (
    adminLookupError || adminProfileError || !adminRecord || !adminProfile ||
    adminProfile.suspended_at || adminProfile.must_change_password
  ) {
    return json(403, { error: "Platform administrator permission required." });
  }

  if (body.action === "create_customer") {
    const email = cleanEmail(body.email || "");
    const name = (body.name || "").trim().slice(0, 80);
    if (!isValidEmail(email)) {
      return json(400, { error: "Enter a valid email address." });
    }
    if (name.length < 2) {
      return json(400, {
        error: "Enter the customer's name (at least 2 characters).",
      });
    }

    const password = temporaryPassword();
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, full_name: name },
      app_metadata: { webloom_must_change_password: true },
    });
    if (error || !data.user) {
      return json(400, {
        error: error?.message || "The account could not be created.",
      });
    }

    // The database trigger sets this during user creation too; this explicit
    // update makes the first-login lock resilient to future Auth trigger changes.
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ display_name: name, must_change_password: true })
      .eq("id", data.user.id);
    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      console.error(
        "Unable to initialize new customer profile",
        profileError.message,
      );
      return json(500, {
        error: "The new account could not be initialized. Please try again.",
      });
    }

    const { error: auditError } = await adminClient.from("audit_logs").insert({
      actor_id: caller.id,
      action: "customer_created",
      target_user_id: data.user.id,
      target_email: email,
      metadata: { access: "admin_created", first_login_password_change: true },
    });
    if (auditError) {
      console.error(
        "Unable to record customer creation audit event",
        auditError.message,
      );
    }

    return json(201, {
      ok: true,
      user: { id: data.user.id, email, name },
      temporaryPassword: password,
    });
  }

  if (body.action === "reset_customer_password") {
    const userId = body.userId || "";
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(userId)
    ) {
      return json(400, { error: "Choose a valid customer account." });
    }
    if (userId === caller.id) {
      return json(400, {
        error:
          "Use your account security settings to change your own password.",
      });
    }

    const { data: targetResult, error: targetError } = await adminClient.auth
      .admin.getUserById(userId);
    const target = targetResult.user;
    if (targetError || !target) {
      return json(404, { error: "Customer account not found." });
    }

    const { data: targetAdmin } = await adminClient
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (targetAdmin) {
      return json(403, {
        error:
          "Administrator passwords cannot be reset from the customer dashboard.",
      });
    }

    const password = temporaryPassword();
    const appMetadata = {
      ...target.app_metadata,
      webloom_must_change_password: true,
    };
    const { error: passwordError } = await adminClient.auth.admin
      .updateUserById(userId, {
        password,
        app_metadata: appMetadata,
      });
    if (passwordError) return json(400, { error: passwordError.message });

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", userId);
    if (profileError) {
      console.error(
        "Unable to set customer password-reset flag",
        profileError.message,
      );
      return json(500, {
        error:
          "The password was reset, but account access could not be refreshed. Contact Webloom support.",
      });
    }

    const { error: auditError } = await adminClient.from("audit_logs").insert({
      actor_id: caller.id,
      action: "customer_password_reset",
      target_user_id: userId,
      target_email: target.email || "",
      metadata: { first_login_password_change: true },
    });
    if (auditError) {
      console.error(
        "Unable to record password-reset audit event",
        auditError.message,
      );
    }

    return json(200, {
      ok: true,
      user: { id: userId, email: target.email || "" },
      temporaryPassword: password,
    });
  }

  if (body.action === "list_subscription_requests") {
    const { data: requests, error: requestsError } = await adminClient
      .from("subscription_requests")
      .select("id,user_id,email,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (requestsError) {
      return json(500, { error: "Subscription requests could not be loaded." });
    }
    return json(200, { ok: true, requests: requests || [] });
  }

  if (body.action === "set_subscription_request_status") {
    const requestId = Number(body.requestId);
    const status = body.status === "approved" ? "approved" : "rejected";
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return json(400, { error: "Choose a valid subscription request." });
    }
    const { error: statusError } = await adminClient.rpc(
      "admin_set_subscription_request_status",
      { p_request_id: requestId, p_status: status },
    );
    if (statusError) {
      return json(400, { error: statusError.message || "The request could not be updated." });
    }
    return json(200, { ok: true });
  }

  if (body.action === "set_user_plan") {
    const targetUserId = body.userId || "";
    const targetPlan = body.plan === "pro" ? "pro" : "free";
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetUserId)
    ) {
      return json(400, { error: "Choose a valid customer account." });
    }
    const { error: planError } = await adminClient.rpc("admin_set_user_plan", {
      p_user_id: targetUserId,
      p_plan: targetPlan,
    });
    if (planError) {
      return json(400, { error: planError.message || "The subscription could not be updated." });
    }
    return json(200, { ok: true });
  }

  return json(400, { error: "Unknown action." });
});
