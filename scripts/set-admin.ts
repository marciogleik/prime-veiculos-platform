import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client with Service Role Key for Admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setAdmin() {
  const email = "devgleik@gmail.com";
  
  // 1. Find user by email in auth.users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Failed to list users:", listError);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found.`);
    console.error("Did you register this account at /login?");
    process.exit(1);
  }

  console.log(`Found auth user ID: ${user.id}`);
  
  // 2. Insert or Update into public.sellers as admin
  const { error: upsertError } = await supabase
    .from('sellers')
    .upsert({
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'Gleik',
      whatsapp: user.user_metadata?.whatsapp || '11999999999',
      is_active: true,
      is_admin: true
    });
    
  if (upsertError) {
    console.error("Failed to update sellers table:", upsertError);
    process.exit(1);
  }
  
  console.log(`✅ Successfully made ${email} an Administrator (is_admin = true)!`);
}

setAdmin();
