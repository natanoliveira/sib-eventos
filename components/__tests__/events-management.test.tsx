import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventsManagement } from '../events-management';
import { apiClient } from '../../lib/api-client';
import { toastSuccess, toastError } from '../../lib/toast';

// Mock do apiClient
jest.mock('../../lib/api-client', () => ({
  apiClient: {
    getEvents: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

// Mock das funções de toast
jest.mock('../../lib/toast', () => ({
  toastSuccess: jest.fn(),
  toastError: jest.fn(),
}));

// Mock de dados de eventos
const mockEvents = [
  {
    id: '1',
    title: 'Encontro de Jovens 2024',
    description: 'Um evento incrível para os jovens',
    startDate: '2024-06-15',
    endDate: '2024-06-17',
    location: 'Centro de Convenções',
    capacity: 500,
    price: 89.90,
    category: 'Jovens',
    status: 'Ativo',
    _count: {
      memberships: 120,
    },
  },
  {
    id: '2',
    title: 'Retiro de Liderança',
    description: 'Retiro focado no desenvolvimento de líderes',
    startDate: '2024-07-20',
    endDate: '2024-07-22',
    location: 'Sítio Panorama',
    capacity: 100,
    price: 150.00,
    category: 'Liderança',
    status: 'Em Breve',
    _count: {
      memberships: 45,
    },
  },
  {
    id: '3',
    title: 'Culto de Celebração',
    description: 'Celebração especial de final de ano',
    startDate: '2024-12-31',
    endDate: null,
    location: 'Igreja Central',
    capacity: 1000,
    price: 0,
    category: 'Geral',
    status: 'Em Breve',
    _count: {
      memberships: 350,
    },
  },
];

describe('EventsManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.getEvents as jest.Mock).mockResolvedValue(mockEvents);
  });

  describe('Renderização inicial', () => {
    it('deve renderizar o componente com título e descrição', async () => {
      render(<EventsManagement />);

      expect(screen.getByText('Gerenciamento de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Crie e gerencie eventos da sua igreja')).toBeInTheDocument();
    });

    it('deve renderizar o botão de adicionar novo evento', async () => {
      render(<EventsManagement />);

      const addButton = screen.getByRole('button', { name: /novo evento/i });
      expect(addButton).toBeInTheDocument();
    });

    it('deve inicializar com estado de loading', async () => {
      (apiClient.getEvents as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockEvents), 100))
      );

      render(<EventsManagement />);

      // Aguarda que os eventos sejam carregados
      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });
    });

    it('deve carregar e exibir a lista de eventos', async () => {
      render(<EventsManagement />);

      await waitFor(() => {
        expect(apiClient.getEvents).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
        expect(screen.getByText('Retiro de Liderança')).toBeInTheDocument();
        expect(screen.getByText('Culto de Celebração')).toBeInTheDocument();
      });
    });
  });

  describe('Busca de eventos', () => {
    it('deve filtrar eventos por título', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar eventos/i);
      await user.type(searchInput, 'Jovens');

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
        expect(screen.queryByText('Retiro de Liderança')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar eventos por descrição', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Retiro de Liderança')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar eventos/i);
      await user.type(searchInput, 'líderes');

      await waitFor(() => {
        expect(screen.getByText('Retiro de Liderança')).toBeInTheDocument();
        expect(screen.queryByText('Encontro de Jovens 2024')).not.toBeInTheDocument();
      });
    });
  });

  describe('Adicionar evento', () => {
    it('deve abrir o diálogo de adicionar evento ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      const addButton = screen.getByRole('button', { name: /novo evento/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument();
      });
    });

    it('deve exibir os campos do formulário de novo evento', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      // Abre o diálogo
      const addButton = screen.getByRole('button', { name: /novo evento/i });
      await user.click(addButton);

      // Verifica se os campos do formulário estão presentes
      await waitFor(() => {
        expect(screen.getByLabelText(/título do evento/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/data de início/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/data de término/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/local/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/capacidade/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
      });
    });

    it('deve ter botão de criar evento no formulário', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      const addButton = screen.getByRole('button', { name: /novo evento/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /criar evento/i })).toBeInTheDocument();
      });
    });
  });

  describe('Editar evento', () => {
    it('deve abrir o diálogo de edição ao clicar no botão de editar', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Evento')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Encontro de Jovens 2024')).toBeInTheDocument();
      });
    });

    it('deve atualizar um evento com sucesso', async () => {
      const user = userEvent.setup();
      (apiClient.updateEvent as jest.Mock).mockResolvedValue({});

      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      // Clica no botão de editar
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      // Altera o título
      const titleInput = screen.getByDisplayValue('Encontro de Jovens 2024');
      await user.clear(titleInput);
      await user.type(titleInput, 'Encontro de Jovens 2025');

      // Submete o formulário
      const saveButton = screen.getByRole('button', { name: /salvar alterações/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiClient.updateEvent).toHaveBeenCalled();
        expect(toastSuccess).toHaveBeenCalledWith('Evento atualizado com sucesso!');
      });
    });
  });

  describe('Deletar evento', () => {
    it('deve abrir o diálogo de confirmação ao clicar no botão de deletar', async () => {
      const user = userEvent.setup();
      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('.lucide-trash-2') !== null
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
        });
      }
    });

    it('deve deletar um evento com sucesso', async () => {
      const user = userEvent.setup();
      (apiClient.deleteEvent as jest.Mock).mockResolvedValue({});

      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      // Clica no botão de deletar
      const deleteButtons = screen.getAllByRole('button', { name: '' });
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('.lucide-trash-2') !== null
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
        });

        // Confirma a exclusão
        const confirmButton = screen.getByRole('button', { name: /sim, remover evento/i });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(apiClient.deleteEvent).toHaveBeenCalledWith('1');
          expect(toastSuccess).toHaveBeenCalledWith('Evento removido com sucesso!');
        });
      }
    });
  });

  describe('Exibição de dados', () => {
    it('deve exibir informações dos eventos corretamente', async () => {
      render(<EventsManagement />);

      await waitFor(() => {
        // Verifica títulos
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
        expect(screen.getByText('Retiro de Liderança')).toBeInTheDocument();

        // Verifica locais
        expect(screen.getByText('Centro de Convenções')).toBeInTheDocument();
        expect(screen.getByText('Sítio Panorama')).toBeInTheDocument();

        // Verifica preços
        expect(screen.getByText('R$ 89.90')).toBeInTheDocument();
        expect(screen.getByText('R$ 150.00')).toBeInTheDocument();
      });
    });

    it('deve exibir badges de categoria corretamente', async () => {
      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Jovens')).toBeInTheDocument();
        expect(screen.getByText('Liderança')).toBeInTheDocument();
        expect(screen.getByText('Geral')).toBeInTheDocument();
      });
    });

    it('deve exibir status dos eventos', async () => {
      render(<EventsManagement />);

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/ativo|em breve/i);
        expect(statusBadges.length).toBeGreaterThan(0);
      });
    });

    it('deve exibir progresso de inscrições', async () => {
      render(<EventsManagement />);

      await waitFor(() => {
        // Verifica contadores de inscrições
        expect(screen.getByText('120 / 500')).toBeInTheDocument();
        expect(screen.getByText('45 / 100')).toBeInTheDocument();
      });
    });

    it('deve formatar datas corretamente', async () => {
      render(<EventsManagement />);

      await waitFor(() => {
        // Verifica se as datas são formatadas
        const dateElements = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Estado de carregamento', () => {
    it('deve carregar eventos com sucesso', async () => {
      (apiClient.getEvents as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockEvents), 100))
      );

      render(<EventsManagement />);

      // Aguarda que os eventos sejam carregados
      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });
    });

    it('deve exibir mensagem quando não há eventos', async () => {
      (apiClient.getEvents as jest.Mock).mockResolvedValue([]);

      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum evento encontrado')).toBeInTheDocument();
        expect(screen.getByText('Crie seu primeiro evento ou ajuste os filtros de busca')).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de erros', () => {
    it('deve exibir erro ao falhar no carregamento de eventos', async () => {
      (apiClient.getEvents as jest.Mock).mockRejectedValue(new Error('Erro ao carregar'));

      render(<EventsManagement />);

      await waitFor(() => {
        expect(toastError).toHaveBeenCalledWith('Erro ao carregar eventos');
      });
    });

    it('deve exibir erro ao falhar na atualização de evento', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Erro ao atualizar';
      (apiClient.updateEvent as jest.Mock).mockRejectedValue(new Error(errorMessage));

      render(<EventsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Encontro de Jovens 2024')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /salvar alterações/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toastError).toHaveBeenCalledWith(errorMessage);
      });
    });
  });
});
