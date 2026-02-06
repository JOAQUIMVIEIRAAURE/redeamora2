import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Process OAuth callback on mount
  useEffect(() => {
    const processOAuthCallback = async () => {
      // Check if this is an OAuth callback (has hash or code parameter)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for error in callback
      const error = hashParams.get('error') || urlParams.get('error');
      const errorDescription = hashParams.get('error_description') || urlParams.get('error_description');
      
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        setAuthError(errorDescription || error);
        // Clear the URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // Check for access_token or code (OAuth callback)
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const code = urlParams.get('code');
      
      if ((accessToken && refreshToken) || code) {
        setIsProcessingCallback(true);
        try {
          if (accessToken && refreshToken) {
            // Token-based callback (implicit flow)
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              console.error('Error setting session:', error);
              setAuthError(error.message);
            }
          }
          // For code-based callback (PKCE flow), supabase should handle it automatically
          // via onAuthStateChange
          
          // Clear the URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('OAuth callback error:', error);
          setAuthError(error instanceof Error ? error.message : 'Erro ao processar autenticação');
        } finally {
          setIsProcessingCallback(false);
        }
      }
    };

    processOAuthCallback();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading || isProcessingCallback) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent px-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl">
            ❤️
          </div>
          <CardTitle className="text-2xl text-primary">Rede Amor a 2</CardTitle>
          <CardDescription>
            Sistema de gestão de células e acompanhamento de membros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {authError}
            </div>
          )}
          <Button 
            onClick={() => {
              setAuthError(null);
              signInWithGoogle();
            }} 
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
