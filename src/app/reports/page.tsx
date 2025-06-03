"use client";
import { reportApi } from '../../lib/api/reportApi';
import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

const ReportViewer = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  };

  const handleGetReport = async (reportType: 'daily' | 'weekly' | 'monthly') => {
    try {
      setLoading(true);   
      setError(null);
      setActiveReport(reportType);
      
      let base64Pdf: string;
      
      switch (reportType) {
        case 'daily':
          base64Pdf = (await reportApi.getDailyReport()).base64;
          break;
        case 'weekly':
          base64Pdf = (await reportApi.getWeeklyReport()).base64;
          break;
        case 'monthly':
          base64Pdf = (await reportApi.getMothlyReport()).base64;
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }
      
      const blob = base64ToBlob(base64Pdf);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
    } catch (err) {
      setError('Error al generar el reporte');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `reporte-${activeReport}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar memoria
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
  };

  const reportTypes = [
    {
      type: 'daily',
      title: 'Reporte Diario',
      description: 'Resumen de actividades del día',
      icon: Calendar,
      gradient: 'from-orange-400 to-orange-600'
    },
    {
      type: 'weekly',
      title: 'Reporte Semanal',
      description: 'Análisis semanal completo',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      type: 'monthly',
      title: 'Reporte Mensual',
      description: 'Vista general del mes',
      icon: BarChart3,
      gradient: 'from-orange-600 to-orange-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-full shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Generador de Reportes
          </h1>
          <p className="text-gray-600 text-lg">
            Selecciona el tipo de reporte que deseas generar
          </p>
        </div>

        {/* Report Type Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <div
                key={report.type}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${report.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="w-8 h-8" />
                    <div className="bg-white/20 rounded-full px-3 py-1">
                      <span className="text-sm font-medium">PDF</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{report.title}</h3>
                  <p className="text-orange-100">{report.description}</p>
                </div>
                
                <div className="p-6">
                  <button
                    onClick={() => handleGetReport(report.type as 'daily' | 'weekly' | 'monthly')}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                      loading && activeReport === report.type
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {loading && activeReport === report.type ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Generando...
                      </div>
                    ) : (
                      'Generar Reporte'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {pdfUrl && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-white mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Vista Previa del Reporte
                    </h3>
                    <p className="text-orange-100">
                      Reporte {activeReport} - {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-96 md:h-[600px]"
                  title="Vista previa del reporte"
                />
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Generando Reporte
              </h3>
              <p className="text-gray-600">
                Por favor espera mientras procesamos tu solicitud...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;