interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-dark-bg font-ubuntu text-dark-text flex flex-col">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface-2 opacity-50" />
      
      {/* Content */}
      <main className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="mb-12 text-center">
            <img 
              src="https://cdn.discordapp.com/attachments/1299199186625101865/1307488641592983592/EOG_Resources_logo-removebg-preview.png?ex=673a7d30&is=67392bb0&hm=72202b5fafbcb048029d2e407106cc2e0427f46e67b10a71ee8793ae4f3fe577&" 
              alt="EOG Resources Logo" 
              className="h-40 mb-8 mx-auto object-contain mix-blend-screen"
            />
            <h2 className="text-3xl font-medium text-dark-text">Welcome Back</h2>
            <p className="text-dark-text-secondary mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="bg-dark-surface border border-dark-surface-2 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg bg-dark-surface-2 border border-dark-surface text-dark-text placeholder-dark-text-secondary/50 focus:border-off-red focus:ring-1 focus:ring-off-red outline-none transition-colors"
                  placeholder="name@eogresources.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 rounded-lg bg-dark-surface-2 border border-dark-surface text-dark-text placeholder-dark-text-secondary/50 focus:border-off-red focus:ring-1 focus:ring-off-red outline-none transition-colors"
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    className="h-4 w-4 bg-dark-surface-2 border-dark-surface rounded text-off-red focus:ring-off-red"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-dark-text-secondary">
                    Remember me
                  </label>
                </div>
                <button 
                  type="button"
                  className="text-sm text-off-red hover:text-red-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-off-red text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors active:bg-red-800 shadow-lg shadow-off-red/20"
              >
                Sign In
              </button>

              <p className="text-center text-sm text-dark-text-secondary">
                Need an account?{' '}
                <button 
                  type="button"
                  className="text-off-red hover:text-red-700 font-medium transition-colors"
                >
                  Contact your administrator
                </button>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
