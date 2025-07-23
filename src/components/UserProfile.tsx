import { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedUserData } from '@/hooks/useUnifiedUserData';
import { 
  User as UserIcon, 
  Camera, 
  Edit, 
  Save, 
  Upload,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Heart,
  Trophy,
  Target,
  Activity,
  Ruler
} from 'lucide-react';

interface UserProfileProps {
  user: User | null;
  onUpdateProfile: (data: any) => void;
}

export const UserProfile = ({ user, onUpdateProfile }: UserProfileProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { userData, loading, saving, saveAllUserData, uploadAvatar } = useUnifiedUserData(user);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      await uploadAvatar(file);
      setIsUploading(false);
    } catch (error) {
      console.error('Erro no upload:', error);
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const result = await saveAllUserData(userData);
      if (result.success) {
        onUpdateProfile(userData);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    saveAllUserData({ [field]: value });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando perfil...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.avatar_url} alt={userData.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                {getInitials(userData.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <Button
              size="icon"
              className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 hover:bg-blue-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white">{userData.full_name}</h2>
            <p className="text-gray-400">{userData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-600">Online</Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil Completo</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input 
                      value={userData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={userData.email}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    <Input 
                      value={userData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Nascimento
                    </Label>
                    <Input 
                      type="date"
                      value={userData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Gênero</Label>
                    <Select value={userData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Cidade
                    </Label>
                    <Input 
                      value={userData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Sua cidade"
                    />
                  </div>
                  
                  <div>
                    <Label>Estado</Label>
                    <Input 
                      value={userData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Seu estado"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Físicos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Dados Físicos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Altura (cm)</Label>
                    <Input 
                      type="number"
                      value={userData.height}
                      onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                      placeholder="170"
                    />
                  </div>
                  
                  <div>
                    <Label>Idade</Label>
                    <Input 
                      type="number"
                      value={userData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                      placeholder="30"
                    />
                  </div>
                  
                  <div>
                    <Label>Nível de Atividade</Label>
                    <Select value={userData.nivel_atividade} onValueChange={(value) => handleInputChange('nivel_atividade', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentario">Sedentário</SelectItem>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="intenso">Intenso</SelectItem>
                        <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Biografia */}
              <div>
                <Label>Biografia</Label>
                <textarea 
                  value={userData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-400" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{userData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{userData.phone || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {userData.birth_date ? new Date(userData.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {userData.city && userData.state ? `${userData.city}, ${userData.state}` : 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {userData.height ? `${userData.height}cm` : 'Não informado'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Minhas Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userData.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Estatísticas do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">127</div>
              <div className="text-sm text-gray-400">Dias Ativo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">23</div>
              <div className="text-sm text-gray-400">Metas Alcançadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">15</div>
              <div className="text-sm text-gray-400">Conquistas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">89%</div>
              <div className="text-sm text-gray-400">Progresso Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
