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
  const isProfileRoute = request.nextUrl.pathname.startsWith('/meu-perfil')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Bloquear acesso anônimo a rotas protegidas
  if ((isAdminRoute || isProfileRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // RBAC: Checar se é admin apenas se tentar acessar o dashboard
  if (isAdminRoute && user) {
    const { data: seller } = await supabase
      .from('sellers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!seller?.is_admin) {
      // Usuários comuns são barrados e enviados ao perfil
      return NextResponse.redirect(new URL('/meu-perfil', request.url))
    }
  }

  // Se já está logado e tenta ir pro login, redireciona pro local correto
  if (isLoginPage && user) {
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
  matcher: [
    '/dashboard/:path*', 
    '/meu-perfil/:path*', 
    '/login'
  ],
}
