import type { Metadata } from 'next'
import RegisterForm from './register-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join VOLT League and start earning points.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
