import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportViewer from '../../app/reports/page';
import { reportApi } from '../../lib/api/reportApi';

jest.mock('../../lib/api/reportApi', () => ({
  reportApi: {
    getDailyReport: jest.fn(),
    getWeeklyReport: jest.fn(),
    getMothlyReport: jest.fn(),
  }
}));

const mockPdf = btoa('%PDF-1.4 dummy pdf content');

describe('ReportViewer', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    jest.clearAllMocks();
  });

  it('renderiza los botones de reporte', () => {
    render(<ReportViewer />);
    expect(screen.getByText('Reporte Diario')).toBeInTheDocument();
    expect(screen.getByText('Reporte Semanal')).toBeInTheDocument();
    expect(screen.getByText('Reporte Mensual')).toBeInTheDocument();
  });

  it('genera el reporte diario correctamente', async () => {
    (reportApi.getDailyReport as jest.Mock).mockResolvedValue({ base64: mockPdf });

    render(<ReportViewer />);
    fireEvent.click(screen.getAllByText('Generar Reporte')[0]);

    expect(await screen.findByText(/Vista Previa del Reporte/)).toBeInTheDocument();
    expect(screen.getByText(/Reporte diario/i)).toBeInTheDocument();
  });

  it('muestra error cuando falla la API', async () => {
    (reportApi.getWeeklyReport as jest.Mock).mockRejectedValue(new Error('Falla'));

    render(<ReportViewer />);
    fireEvent.click(screen.getAllByText('Generar Reporte')[1]);

    await waitFor(() => {
      expect(screen.getByText('Error al generar el reporte')).toBeInTheDocument();
    });
  });

  it('dispara la descarga del PDF', async () => {
    (reportApi.getMothlyReport as jest.Mock).mockResolvedValue({ base64: mockPdf });

    const createSpy = jest.spyOn(document, 'createElement');
    render(<ReportViewer />);
    fireEvent.click(screen.getAllByText('Generar Reporte')[2]);

    const descargar = await screen.findByText('Descargar');
    fireEvent.click(descargar);

    expect(createSpy).toHaveBeenCalledWith('a');
  });
});
