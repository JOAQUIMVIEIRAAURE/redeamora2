import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';

interface AccessCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleTitle: string;
  onSuccess: () => void;
  accessCode: string;
}

export function AccessCodeDialog({
  open,
  onOpenChange,
  roleTitle,
  onSuccess,
  accessCode,
}: AccessCodeDialogProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputCode.toUpperCase() === accessCode.toUpperCase()) {
      setError(false);
      setInputCode('');
      setAttempts(0);
      onSuccess();
      onOpenChange(false);
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
    }
  };

  const handleClose = () => {
    setInputCode('');
    setError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Código de Acesso</DialogTitle>
          </div>
          <DialogDescription>
            Digite o código de acesso para entrar como <strong>{roleTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">Código</Label>
            <Input
              id="access-code"
              type="password"
              placeholder="Digite o código..."
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setError(false);
              }}
              className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              autoFocus
              autoComplete="off"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Código incorreto. Tente novamente.</span>
              </div>
            )}
            {attempts >= 3 && (
              <p className="text-xs text-muted-foreground">
                Dica: Entre em contato com o administrador do sistema para obter o código.
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!inputCode.trim()}>
              Acessar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
