"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.replace("/");
    };
    checkUser();
  }, [router]);

  function validatePassword(pw: string) {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(pw);
  }

  async function handleLogin() {
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message.includes("Invalid login credentials")
          ? "Wrong email or password"
          : error.message
      );
    } else {
      setSuccess("Logged in successfully!");
      router.replace("/");
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) setError(error.message);
    else setSuccess("Password reset email sent! Check your inbox.");
  }

  async function handleSignup() {
    setError(null);
    setSuccess(null);

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, include one uppercase letter, one number, and one special character."
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://yourproject.vercel.app/login",
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      setSuccess("Account created! Check your email to confirm your account.");
      // Clear the form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsRegister(false); // Switch back to login view
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 flex flex-col gap-4 bg-rose-50 p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-rose-800 mb-2 text-center">
        {isRegister ? "Register" : "Login"}
      </h1>

      <input
        type="email"
        placeholder="Email"
        className="border rounded px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border rounded px-3 py-2 w-full pr-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-600"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {isRegister && (
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="border rounded px-3 py-2 w-full pr-12"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-600"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      )}

      {isRegister ? (
        <button
          onClick={handleSignup}
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Sign Up
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-rose-600 text-white py-2 rounded hover:bg-rose-700 transition"
        >
          Log In
        </button>
      )}

      <button
        onClick={() => setIsRegister(!isRegister)}
        className="text-sm text-blue-600 hover:underline"
      >
        {isRegister
          ? "Already have an account? Log in"
          : "Don't have an account? Register"}
      </button>

      {!isRegister && (
        <button
          onClick={handleForgotPassword}
          className="text-sm text-rose-600 hover:underline"
        >
          Forgot password?
        </button>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-3 py-2 rounded mt-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded mt-2 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
