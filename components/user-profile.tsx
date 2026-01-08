"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { User, Mail, Phone, MapPin, Lock, CheckCircle, AlertCircle, Camera, Upload } from "lucide-react";
import { apiClient } from '../lib/api-client';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    image: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUser(profile);
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        image: profile.image || '',
      });
      setImagePreview(profile.image || '');
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida' });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    setUpdating(true);
    setMessage(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        await apiClient.updateProfile({ ...profileData, image: base64Image });
        setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
        await loadProfile();
        setSelectedImage(null);
      };
      reader.readAsDataURL(selectedImage);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao fazer upload da foto' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      await apiClient.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      await loadProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil' });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      await apiClient.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Carregando perfil...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            ✕
          </Button>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-blue-200">
                <AvatarImage src={imagePreview || user?.image} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-2 border-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {selectedImage && (
              <Button
                type="button"
                size="sm"
                onClick={handleUploadImage}
                disabled={updating}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {updating ? 'Enviando...' : 'Salvar Foto'}
              </Button>
            )}

            <div>
              <CardTitle className="text-blue-900">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="password">Alterar Senha</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10 border-blue-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 border-blue-200"
                        required
                        disabled // Email usually can't be changed
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10 border-blue-200"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10 border-blue-200"
                        placeholder="Cidade, Estado"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Senha Atual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                      className="pl-10 border-blue-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="pl-10 border-blue-200"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 border-blue-200"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
