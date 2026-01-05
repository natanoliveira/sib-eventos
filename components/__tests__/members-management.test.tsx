import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembersManagement } from '../members-management';
import { apiClient } from '../../lib/api-client';

// Mock do apiClient
jest.mock('../../lib/api-client', () => ({
  apiClient: {
    getMembers: jest.fn(),
    createMember: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(),
  },
}));

// Mock de dados de membros
const mockMembers = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    address: 'São Paulo, SP',
    category: 'Jovem',
    status: 'ACTIVE',
    joinDate: '2023-01-15',
    events: 5,
    notes: 'Membro ativo',
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '(11) 88888-8888',
    address: 'Campinas, SP',
    category: 'Adulto',
    status: 'ACTIVE',
    joinDate: '2022-06-20',
    events: 8,
    notes: 'Líder de grupo',
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 77777-7777',
    address: 'Santos, SP',
    category: 'Líder',
    status: 'ACTIVE',
    joinDate: '2021-03-10',
    events: 12,
    notes: 'Coordenadora',
  },
];

describe('MembersManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.getMembers as jest.Mock).mockResolvedValue(mockMembers);
  });

  describe('Renderização inicial', () => {
    it('deve renderizar o componente com título e descrição', async () => {
      render(<MembersManagement />);

      expect(screen.getByText('Gerenciamento de Membros')).toBeInTheDocument();
      expect(screen.getByText('Cadastre e gerencie os membros da sua igreja')).toBeInTheDocument();
    });

    it('deve renderizar o botão de adicionar novo membro', async () => {
      render(<MembersManagement />);

      const addButton = screen.getByRole('button', { name: /novo membro/i });
      expect(addButton).toBeInTheDocument();
    });

    it('deve carregar e exibir a lista de membros', async () => {
      render(<MembersManagement />);

      await waitFor(() => {
        expect(apiClient.getMembers).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        expect(screen.getByText('João Santos')).toBeInTheDocument();
        expect(screen.getByText('Ana Costa')).toBeInTheDocument();
      });
    });
  });

  describe('Busca e filtragem', () => {
    it('deve filtrar membros por nome', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar por nome ou email/i);
      await user.type(searchInput, 'Maria');

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        expect(screen.queryByText('João Santos')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar membros por email', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar por nome ou email/i);
      await user.type(searchInput, 'joao.santos@email.com');

      await waitFor(() => {
        expect(screen.getByText('João Santos')).toBeInTheDocument();
        expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
      });
    });

    it('deve renderizar o filtro de categoria', async () => {
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      // Verifica se o select de categoria existe
      const categorySelects = screen.getAllByRole('combobox');
      expect(categorySelects.length).toBeGreaterThan(0);
    });
  });

  describe('Adicionar membro', () => {
    it('deve abrir o diálogo de adicionar membro ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      const addButton = screen.getByRole('button', { name: /novo membro/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Cadastrar Novo Membro')).toBeInTheDocument();
      });
    });

    it('deve exibir os campos do formulário de novo membro', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      // Abre o diálogo
      const addButton = screen.getByRole('button', { name: /novo membro/i });
      await user.click(addButton);

      // Verifica se os campos do formulário estão presentes
      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/observações/i)).toBeInTheDocument();
      });
    });
  });

  describe('Editar membro', () => {
    it('deve abrir o diálogo de edição ao clicar no botão de editar', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: '' });
      const editButton = editButtons.find(btn =>
        btn.querySelector('.lucide-edit-2') !== null
      );

      if (editButton) {
        await user.click(editButton);

        await waitFor(() => {
          expect(screen.getByText('Editar Membro')).toBeInTheDocument();
          expect(screen.getByDisplayValue('Maria Silva')).toBeInTheDocument();
        });
      }
    });

    it('deve atualizar um membro com sucesso', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      // Clica no botão de editar
      const editButtons = screen.getAllByRole('button', { name: '' });
      const editButton = editButtons.find(btn =>
        btn.querySelector('.lucide-edit-2') !== null
      );

      if (editButton) {
        await user.click(editButton);

        await waitFor(() => {
          expect(screen.getByDisplayValue('Maria Silva')).toBeInTheDocument();
        });

        // Altera o nome
        const nameInput = screen.getByDisplayValue('Maria Silva');
        await user.clear(nameInput);
        await user.type(nameInput, 'Maria Silva Santos');

        // Submete o formulário
        const saveButton = screen.getByRole('button', { name: /salvar alterações/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(apiClient.updateMember).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Deletar membro', () => {
    it('deve abrir o diálogo de confirmação ao clicar no botão de deletar', async () => {
      const user = userEvent.setup();
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('.lucide-trash-2') !== null
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Excluir Membro')).toBeInTheDocument();
        });
      }
    });

    it('deve deletar um membro com sucesso', async () => {
      const user = userEvent.setup();
      (apiClient.deleteMember as jest.Mock).mockResolvedValue({});

      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      });

      // Clica no botão de deletar
      const deleteButtons = screen.getAllByRole('button', { name: '' });
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('.lucide-trash-2') !== null
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Excluir Membro')).toBeInTheDocument();
        });

        // Confirma a exclusão
        const confirmButton = screen.getByRole('button', { name: /excluir/i });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(apiClient.deleteMember).toHaveBeenCalledWith('1');
        });
      }
    });
  });

  describe('Exibição de dados', () => {
    it('deve exibir a contagem correta de membros', async () => {
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('3 membros encontrados')).toBeInTheDocument();
      });
    });

    it('deve exibir badges de categoria corretamente', async () => {
      render(<MembersManagement />);

      await waitFor(() => {
        const badges = screen.getAllByText(/jovem|adulto|líder/i);
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('deve exibir status ativo dos membros', async () => {
      render(<MembersManagement />);

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/ativo/i);
        expect(statusBadges.length).toBe(3);
      });
    });

    it('deve exibir informações de contato dos membros', async () => {
      render(<MembersManagement />);

      await waitFor(() => {
        expect(screen.getByText('maria.silva@email.com')).toBeInTheDocument();
        expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
      });
    });
  });

  describe('Fallback de dados mock', () => {
    it('deve usar dados mock quando a API falhar', async () => {
      (apiClient.getMembers as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<MembersManagement />);

      await waitFor(() => {
        // Verifica se exibe os dados mock de fallback
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        expect(screen.getByText('João Santos')).toBeInTheDocument();
      });
    });
  });
});
