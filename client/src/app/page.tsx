import Image from "next/image"
import { assets } from "../../public/assets"
import { Star } from "lucide-react"
import LoginForm from "@/components/LoginForm"
import GuestGuard from "@/components/GuestGuard"

const Login = () => {
  return (
    <GuestGuard>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* BACKGROUND IMAGE */}
        <Image
          src={assets.clouds}
          alt="Background"
          fill
          className="absolute top-0 left-0 -z-1 w-full h-full object-cover opacity-65"
        />

        {/* LEFT SIDE: BRANDING */}
        <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">
          <Image src={assets.monolith_logo} width={120} height={40} alt="Logo" className="h-10  object-contain" />

          <div>
            <h1 className="text-3xl md:text-6xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">More then just friends truly connect</h1>
            <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">connect with global community on monolith.</p>
          </div>

          <span className="md:h-10"></span>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <LoginForm />
        </div>
      </div>
    </GuestGuard>
  )
}

export default Login

