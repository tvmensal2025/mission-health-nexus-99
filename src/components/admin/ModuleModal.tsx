import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  X, 
  Save, 
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: ModuleFormData) => void;
  courses: Array<{ id: string; title: string }>;
}

interface ModuleFormData {
  title: string;
  description: string;
  courseId: string;
  order: number;
  isActive: boolean;
}

export const ModuleModal = ({ isOpen, onClose, onSubmit, courses }: ModuleModalProps) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    courseId: "",
    order: 1,
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ModuleFormData, value: string | number | boolean) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.courseId) {
      newErrors.courseId = "Curso é obrigatório";
    }

    if (formData.order < 1) {
      newErrors.order = "Ordem deve ser maior que 0";
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
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        courseId: "",
        order: 1,
        isActive: true
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        courseId: "",
        order: 1,
        isActive: true
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-6 w-6 text-blue-500" />
            CRIAR NOVO MÓDULO
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título do Módulo */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-300">
              📝 Título do Módulo
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título do módulo..."
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
              placeholder="Descreva o conteúdo e objetivos do módulo..."
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

          {/* Curso e Ordem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseId" className="text-sm font-medium text-gray-300">
                📚 Curso
              </Label>
              <Select value={formData.courseId} onValueChange={(value) => handleInputChange("courseId", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-white hover:bg-gray-700">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.courseId}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-medium text-gray-300">
                🔢 Ordem
              </Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
                className="bg-gray-800 border-gray-600 text-white"
              />
              {errors.order && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.order}
                </div>
              )}
            </div>
          </div>

          {/* Módulo Ativo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="text-sm font-medium text-gray-300">
              ✅ Módulo Ativo
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          {/* Informações do Curso Selecionado */}
          {formData.courseId && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Módulo será adicionado ao curso: </span>
                <span className="font-medium text-white">
                  {courses.find(c => c.id === formData.courseId)?.title}
                </span>
              </div>
            </div>
          )}
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
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "💾 Salvar Módulo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 