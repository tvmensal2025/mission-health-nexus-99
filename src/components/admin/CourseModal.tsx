import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  X, 
  Save, 
  Upload, 
  DollarSign,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: CourseFormData) => void;
}

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  coverImage?: File;
}

const categories = [
  "Desenvolvimento Pessoal",
  "Saúde e Bem-estar",
  "Nutrição",
  "Fitness",
  "Meditação",
  "Terapia",
  "Coaching",
  "Educação"
];

export const CourseModal = ({ isOpen, onClose, onSubmit }: CourseModalProps) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    price: 0,
    isActive: true
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória";
    }

    if (formData.price < 0) {
      newErrors.price = "Preço não pode ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const courseData = {
        ...formData,
        coverImage: coverImage || undefined
      };
      
      await onSubmit(courseData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        price: 0,
        isActive: true
      });
      setCoverImage(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Erro ao criar curso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        category: "",
        price: 0,
        isActive: true
      });
      setCoverImage(null);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-red-500" />
            CRIAR NOVO CURSO
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título do Curso */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-300">
              📚 Título do Curso
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título do curso..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              📄 Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o conteúdo e objetivos do curso..."
              rows={4}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Categoria e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-300">
                🏷️ Categoria
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-300">
                💰 Preço
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              {formData.price === 0 && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Gratuito
                </Badge>
              )}
              {errors.price && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.price}
                </div>
              )}
            </div>
          </div>

          {/* Imagem de Capa */}
          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-sm font-medium text-gray-300">
              🖼️ Imagem de Capa
            </Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="coverImage" className="cursor-pointer">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 mb-1">
                  {coverImage ? coverImage.name : "📁 Escolher Arquivo"}
                </p>
                <p className="text-gray-400 text-sm">
                  PNG, JPG até 5MB
                </p>
              </label>
            </div>
            {coverImage && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                Arquivo selecionado: {coverImage.name}
              </div>
            )}
          </div>

          {/* Curso Ativo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="text-sm font-medium text-gray-300">
              ✅ Curso Ativo
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "💾 Salvar Curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 