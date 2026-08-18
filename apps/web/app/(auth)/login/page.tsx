import type { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your VOLT League account.',
}

export default function LoginPage() {
  return <LoginForm />
}
