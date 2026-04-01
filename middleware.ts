import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // RBAC: Check if user is admin if they try to access /dashboard
  if (isAdminRoute && user) {
    const { data: seller } = await supabase
      .from('sellers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!seller?.is_admin) {
      // Redirect regular users to their profile page instead of the dashboard
      return NextResponse.redirect(new URL('/meu-perfil', request.url))
    }
  }

  if (isLoginPage && user) {
    // Correctly redirect after login based on role
    const { data: seller } = await supabase
      .from('sellers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const redirectPath = seller?.is_admin ? '/dashboard' : '/meu-perfil'
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
