import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, disability_type, avatar_url } = await request.json()

    // Validate required fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico válido" },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (!full_name?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        originalError: authError
      })
      
      let errorMessage = authError.message
      if (authError.code === 'email_address_invalid') {
        errorMessage = "El correo electrónico proporcionado no es válido o no está permitido"
      }
      
      return NextResponse.json({ error: errorMessage }, { status: authError.status || 400 })
    }

    // 2. Create user profile in users table
    if (authData.user) {
      const userProfile = {
        id: authData.user.id,
        email: email.trim(),
        full_name: full_name.trim(),
        disability_type: disability_type || null,
        avatar_url: avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert(userProfile)

      if (profileError) {
        // Rollback: Delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        )
      }

      // 3. Create welcome notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: authData.user.id,
          title: "Welcome to Justicia Accesible!",
          message: "Thank you for registering. We're here to help with specialized legal advice.",
          type: "system",
        })

      if (notificationError) {
        console.error('Notification error:', notificationError)
        // This is non-critical, so we don't rollback
      }

      return NextResponse.json({
        message: "User registered successfully",
        user: {
          id: authData.user.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          disability_type: userProfile.disability_type,
          avatar_url: userProfile.avatar_url,
        },
      })
    }

    return NextResponse.json(
      { error: "Unexpected error during registration" },
      { status: 500 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}