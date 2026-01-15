import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  FileText,
  MapPin,
  PencilLine,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appointmentsAPI, appointmentProtocolsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';

type DamagePoint = {
  id: string;
  x: number;
  y: number;
  type: string;
  note: string;
};

type ProtocolData = {
  mileage: string;
  fuelLevel: string;
  accessories: string;
  notes: string;
  damages: DamagePoint[];
  clientSignature?: string;
  employeeSignature?: string;
  intakePhotos: string[];
  releasePhotos: string[];
  createdAt: string;
};

const damageTypes = [
  { value: 'scratch', label: 'Rysa' },
  { value: 'dent', label: 'Wgniecenie' },
  { value: 'crack', label: 'Pęknięcie' },
  { value: 'paint', label: 'Uszkodzenie lakieru' },
  { value: 'glass', label: 'Szkło' },
  { value: 'other', label: 'Inne' },
];

const fuelLevels = ['0%', '25%', '50%', '75%', '100%'];

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function CarProtocolPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedDamageType, setSelectedDamageType] = useState(damageTypes[0].value);
  const [signatureTarget, setSignatureTarget] = useState<'client' | 'employee' | null>(null);
  const createEmptyProtocol = (): ProtocolData => ({
    mileage: '',
    fuelLevel: '',
    accessories: '',
    notes: '',
    damages: [],
    clientSignature: '',
    employeeSignature: '',
    intakePhotos: [],
    releasePhotos: [],
    createdAt: new Date().toISOString(),
  });
  const [protocol, setProtocol] = useState<ProtocolData>(() => createEmptyProtocol());

  const carImageUrl = '/autoprotocol.png';

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await appointmentsAPI.getOne(id);
        const apt = response.data.data;
        setAppointment({
          id: apt.id.toString(),
          clientId: apt.client_id.toString(),
          carId: apt.car_id.toString(),
          serviceId: apt.service_id ? apt.service_id.toString() : undefined,
          serviceIds: Array.isArray(apt.service_ids) ? apt.service_ids.map((value: any) => value.toString()) : undefined,
          employeeId: apt.employee_id ? apt.employee_id.toString() : undefined,
          date: new Date(apt.date),
          startTime: apt.start_time,
          status: apt.status as any,
          notes: apt.notes || undefined,
          price: apt.price ? parseFloat(apt.price) : undefined,
          extraCost: apt.extra_cost ? parseFloat(apt.extra_cost) : undefined,
          client: apt.first_name ? {
            firstName: apt.first_name,
            lastName: apt.last_name,
            phone: apt.phone,
            email: apt.email,
          } : undefined,
          car: apt.brand ? {
            brand: apt.brand,
            model: apt.model,
            color: apt.color,
            plateNumber: apt.plate_number,
          } : undefined,
          services: Array.isArray(apt.services) ? apt.services.map((service: any) => ({
            id: service.id?.toString?.() ?? service.id,
            name: service.name,
            duration: service.duration,
            category: service.category,
            price: service.price ? parseFloat(service.price) : service.price,
            description: service.description,
          })) : undefined,
          service: apt.service_name ? {
            name: apt.service_name,
            duration: apt.duration,
            category: apt.category,
          } : undefined,
          employee: apt.employee_name ? {
            name: apt.employee_name,
            role: apt.employee_role,
          } : undefined,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: error.response?.data?.error || 'Nie udało się pobrać wizyty',
        });
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, navigate, toast]);

  useEffect(() => {
    if (!id) return;
    const fetchProtocol = async () => {
      try {
        const response = await appointmentProtocolsAPI.get(id);
        const data = response.data.data;
        if (!data) {
          setProtocol(createEmptyProtocol());
          return;
        }
        setProtocol({
          mileage: data.mileage ?? '',
          fuelLevel: data.fuel_level ?? data.fuelLevel ?? '',
          accessories: data.accessories ?? '',
          notes: data.notes ?? '',
          damages: Array.isArray(data.damages) ? data.damages : [],
          clientSignature: data.client_signature ?? data.clientSignature ?? '',
          employeeSignature: data.employee_signature ?? data.employeeSignature ?? '',
          intakePhotos: Array.isArray(data.photos_intake) ? data.photos_intake : [],
          releasePhotos: Array.isArray(data.photos_release) ? data.photos_release : [],
          createdAt: data.created_at ?? new Date().toISOString(),
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: error.response?.data?.error || 'Nie udało się pobrać protokołu',
        });
      }
    };

    fetchProtocol();
  }, [id, toast]);

  useEffect(() => {
    if (!signatureTarget || !signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = canvas;
    canvas.width = clientWidth * ratio;
    canvas.height = clientHeight * ratio;
    context.scale(ratio, ratio);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#111827';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, clientWidth, clientHeight);
    const existingSignature =
      signatureTarget === 'client' ? protocol.clientSignature : protocol.employeeSignature;
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, clientWidth, clientHeight);
      };
      img.src = existingSignature;
    }
  }, [signatureTarget, protocol.clientSignature, protocol.employeeSignature]);

  const updateProtocol = (patch: Partial<ProtocolData>) => {
    setProtocol((prev) => ({ ...prev, ...patch }));
  };

  const handleImageClick = (event: React.MouseEvent) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const clampedX = Math.min(Math.max(x, 0), 1);
    const clampedY = Math.min(Math.max(y, 0), 1);
    const newPoint: DamagePoint = {
      id: createId(),
      x: clampedX,
      y: clampedY,
      type: selectedDamageType,
      note: '',
    };
    updateProtocol({ damages: [...protocol.damages, newPoint] });
  };

  const handleRemovePoint = (pointId: string) => {
    updateProtocol({ damages: protocol.damages.filter((point) => point.id !== pointId) });
  };

  const handleUpdatePoint = (pointId: string, patch: Partial<DamagePoint>) => {
    updateProtocol({
      damages: protocol.damages.map((point) => (point.id === pointId ? { ...point, ...patch } : point)),
    });
  };

  const handleSignaturePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    setIsDrawing(true);
  };

  const handleSignaturePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
  };

  const endSignature = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current || !isDrawing) return;
    setIsDrawing(false);
    if (event?.pointerId != null) {
      signatureCanvasRef.current.releasePointerCapture(event.pointerId);
    }
    const dataUrl = signatureCanvasRef.current.toDataURL('image/png');
    if (signatureTarget === 'client') {
      updateProtocol({ clientSignature: dataUrl });
    } else if (signatureTarget === 'employee') {
      updateProtocol({ employeeSignature: dataUrl });
    }
  };

  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (signatureTarget === 'client') {
      updateProtocol({ clientSignature: '' });
    } else if (signatureTarget === 'employee') {
      updateProtocol({ employeeSignature: '' });
    }
  };

  const saveSignature = () => {
    if (!signatureCanvasRef.current) return;
    const dataUrl = signatureCanvasRef.current.toDataURL('image/png');
    if (signatureTarget === 'client') {
      updateProtocol({ clientSignature: dataUrl });
    } else if (signatureTarget === 'employee') {
      updateProtocol({ employeeSignature: dataUrl });
    }
    setSignatureTarget(null);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleAddPhotos = async (kind: 'intake' | 'release', files: FileList | null) => {
    if (!files || files.length === 0) return;
    const dataUrls = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
    if (kind === 'intake') {
      updateProtocol({ intakePhotos: [...protocol.intakePhotos, ...dataUrls] });
    } else {
      updateProtocol({ releasePhotos: [...protocol.releasePhotos, ...dataUrls] });
    }
  };

  const handleRemovePhoto = (kind: 'intake' | 'release', index: number) => {
    if (kind === 'intake') {
      updateProtocol({
        intakePhotos: protocol.intakePhotos.filter((_, idx) => idx !== index),
      });
    } else {
      updateProtocol({
        releasePhotos: protocol.releasePhotos.filter((_, idx) => idx !== index),
      });
    }
  };

  const handleSaveProtocol = async () => {
    if (!id) return;
    const payload = {
      mileage: protocol.mileage || null,
      fuel_level: protocol.fuelLevel || null,
      accessories: protocol.accessories || null,
      notes: protocol.notes || null,
      damages: protocol.damages,
      client_signature: protocol.clientSignature || null,
      employee_signature: protocol.employeeSignature || null,
      photos_intake: protocol.intakePhotos,
      photos_release: protocol.releasePhotos,
    };
    try {
      const response = await appointmentProtocolsAPI.save(id, payload);
      const data = response.data.data;
      if (data) {
        setProtocol({
          mileage: data.mileage ?? '',
          fuelLevel: data.fuel_level ?? data.fuelLevel ?? '',
          accessories: data.accessories ?? '',
          notes: data.notes ?? '',
          damages: Array.isArray(data.damages) ? data.damages : [],
          clientSignature: data.client_signature ?? data.clientSignature ?? '',
          employeeSignature: data.employee_signature ?? data.employeeSignature ?? '',
          intakePhotos: Array.isArray(data.photos_intake) ? data.photos_intake : [],
          releasePhotos: Array.isArray(data.photos_release) ? data.photos_release : [],
          createdAt: data.created_at ?? new Date().toISOString(),
        });
      }
      toast({
        title: 'Zapisano protokół',
        description: 'Dane zostały zapisane w bazie.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.response?.data?.error || 'Nie udało się zapisać protokołu',
      });
    }
  };

  const renderAnnotatedImage = async () => {
    const image = new Image();
    image.src = carImageUrl;
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || 1000;
    canvas.height = image.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    protocol.damages.forEach((point, index) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      ctx.beginPath();
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${index + 1}`, x, y);
    });
    return canvas.toDataURL('image/png');
  };

  const buildPrintHtml = (annotatedImage: string) => {
    const client = appointment?.client;
    const car = appointment?.car;
    const damageRows = protocol.damages
      .map((point, index) => {
        const typeLabel = damageTypes.find((t) => t.value === point.type)?.label || point.type;
        const note = point.note ? point.note : '—';
        return `<tr><td>${index + 1}</td><td>${typeLabel}</td><td>${note}</td></tr>`;
      })
      .join('');

    return `
      <html>
        <head>
          <title>Protokół odbioru auta</title>
          <style>
            @page { margin: 14mm; }
            body { font-family: Arial, sans-serif; margin: 0; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
            .card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
            .section-title { font-weight: bold; margin-bottom: 8px; }
            .image-wrap { text-align: center; margin: 8px 0 12px; }
            img { max-width: 100%; max-height: 45vh; height: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #e5e7eb; padding: 6px; font-size: 12px; text-align: left; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
            .signature-box { border-top: 1px solid #9ca3af; padding-top: 6px; text-align: center; }
            .page { padding: 0 14mm 14mm; }
          </style>
        </head>
        <body>
          <div class="page">
            <h1>Protokół odbioru auta</h1>
            <div class="grid">
              <div class="card">
                <div class="section-title">Klient</div>
                <div>${client?.firstName || ''} ${client?.lastName || ''}</div>
                <div>${client?.phone || ''}</div>
                <div>${client?.email || ''}</div>
              </div>
              <div class="card">
                <div class="section-title">Pojazd</div>
                <div>${car?.brand || ''} ${car?.model || ''}</div>
                <div>${car?.plateNumber || ''}</div>
                <div>${car?.color || ''}</div>
              </div>
            </div>
            <div class="grid">
              <div class="card">
                <div class="section-title">Szczegóły</div>
                <div>Przebieg: ${protocol.mileage || '—'} km</div>
                <div>Poziom paliwa: ${protocol.fuelLevel || '—'}</div>
                <div>Wyposażenie: ${protocol.accessories || '—'}</div>
              </div>
              <div class="card">
                <div class="section-title">Uwagi</div>
                <div>${protocol.notes || '—'}</div>
              </div>
            </div>
            <div class="image-wrap">
              <img src="${annotatedImage}" alt="Rzut pojazdu" />
            </div>
            <div class="card">
              <div class="section-title">Lista uszkodzeń</div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Typ</th>
                    <th>Opis</th>
                  </tr>
                </thead>
                <tbody>
                  ${damageRows || '<tr><td colspan="3">Brak uszkodzeń</td></tr>'}
                </tbody>
              </table>
            </div>
            <div class="signatures">
              <div class="signature-box">
                ${protocol.clientSignature ? `<img src="${protocol.clientSignature}" style="max-height: 120px; margin-bottom: 6px;" />` : ''}
                Podpis klienta
              </div>
              <div class="signature-box">
                ${protocol.employeeSignature ? `<img src="${protocol.employeeSignature}" style="max-height: 120px; margin-bottom: 6px;" />` : ''}
                Podpis pracownika
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    const annotatedImage = await renderAnnotatedImage();
    const html = buildPrintHtml(annotatedImage);
    const printWindow = window.open('', '_blank', 'width=1200,height=900');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      toast({
        variant: 'destructive',
        title: 'Drukowanie',
        description: 'Przeglądarka zablokowała okno drukowania.',
      });
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => iframe.remove(), 1000);
      }
    }, 300);
  };

  const handleClearAllPoints = () => {
    updateProtocol({ damages: [] });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-muted-foreground">Ładowanie protokołu...</div>
        </div>
      </AppLayout>
    );
  }

  if (!appointment) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-muted-foreground">Nie znaleziono wizyty.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="w-4 h-4" />
              <span>
                {appointment.car?.brand || ''} {appointment.car?.model || ''} • {appointment.car?.plateNumber || ''}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1">Protokół odbioru auta</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do wizyty
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Generuj PDF / drukuj
            </Button>
            <Button className="gradient-brand shadow-button" onClick={handleSaveProtocol}>
              <Save className="w-4 h-4 mr-2" />
              Zapisz protokół
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Zaznacz uszkodzenia na rzucie
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedDamageType} onValueChange={setSelectedDamageType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Typ uszkodzenia" />
                    </SelectTrigger>
                    <SelectContent>
                      {damageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-md border bg-white flex items-center justify-center">
                <div
                  ref={imageContainerRef}
                  className="relative inline-block cursor-crosshair select-none"
                  onClick={handleImageClick}
                >
                  <img
                    src={carImageUrl}
                    alt="Rzut pojazdu"
                    className="block max-h-[70vh] max-w-full h-auto w-auto"
                  />
                  {protocol.damages.map((point, index) => (
                    <div
                      key={point.id}
                      className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 text-xs font-semibold text-white shadow"
                      style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
                      title={`${index + 1}. ${damageTypes.find((t) => t.value === point.type)?.label || ''}`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Kliknij na obrazek, aby dodać punkt. Możesz powiększyć rzut, aby łatwiej trafić w miejsce.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <PencilLine className="w-4 h-4" />
                  Lista uszkodzeń
                </div>
                {protocol.damages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAllPoints}>
                    Wyczyść listę
                  </Button>
                )}
              </div>
              {protocol.damages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak dodanych uszkodzeń.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {protocol.damages.map((point, index) => (
                    <div key={point.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePoint(point.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Select
                        value={point.type}
                        onValueChange={(value) => handleUpdatePoint(point.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Typ uszkodzenia" />
                        </SelectTrigger>
                        <SelectContent>
                          {damageTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Opis uszkodzenia"
                        value={point.note}
                        onChange={(event) => handleUpdatePoint(point.id, { note: event.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Dane protokołu
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Przebieg (km)</Label>
                <Input
                  id="mileage"
                  placeholder="np. 125000"
                  value={protocol.mileage}
                  onChange={(event) => updateProtocol({ mileage: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Poziom paliwa</Label>
                <Select
                  value={protocol.fuelLevel}
                  onValueChange={(value) => updateProtocol({ fuelLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz poziom" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessories">Wyposażenie / dodatki</Label>
                <Input
                  id="accessories"
                  placeholder="np. fotelik, dywaniki, bagażnik"
                  value={protocol.accessories}
                  onChange={(event) => updateProtocol({ accessories: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Uwagi ogólne</Label>
                <Textarea
                  id="notes"
                  placeholder="Dodatkowe informacje"
                  value={protocol.notes}
                  onChange={(event) => updateProtocol({ notes: event.target.value })}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <PencilLine className="w-4 h-4" />
                Podpisy
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border p-3 space-y-2">
                  <div className="text-sm font-medium">Klient</div>
                  <div className="h-24 rounded-md border bg-white flex items-center justify-center overflow-hidden">
                    {protocol.clientSignature ? (
                      <img src={protocol.clientSignature} alt="Podpis klienta" className="max-h-full" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Brak podpisu</span>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setSignatureTarget('client')}>
                    Podpis klienta
                  </Button>
                </div>
                <div className="rounded-md border p-3 space-y-2">
                  <div className="text-sm font-medium">Pracownik</div>
                  <div className="h-24 rounded-md border bg-white flex items-center justify-center overflow-hidden">
                    {protocol.employeeSignature ? (
                      <img src={protocol.employeeSignature} alt="Podpis pracownika" className="max-h-full" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Brak podpisu</span>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setSignatureTarget('employee')}>
                    Podpis pracownika
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Podpisy najlepiej zbierać na tablecie, w trybie pełnoekranowym.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Car className="w-4 h-4" />
                Zdjęcia auta
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Przyjęcie pojazdu</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      id="intake-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleAddPhotos('intake', event.target.files)}
                    />
                    <Button asChild type="button" variant="outline" size="sm">
                      <label htmlFor="intake-photos">Dodaj zdjęcia</label>
                    </Button>
                  </div>
                  {protocol.intakePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {protocol.intakePhotos.map((photo, index) => (
                        <div key={`${photo}-${index}`} className="relative group">
                          <img src={photo} alt="Zdjęcie przyjęcia" className="h-24 w-full rounded-md object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto('intake', index)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Wydanie pojazdu</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      id="release-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleAddPhotos('release', event.target.files)}
                    />
                    <Button asChild type="button" variant="outline" size="sm">
                      <label htmlFor="release-photos">Dodaj zdjęcia</label>
                    </Button>
                  </div>
                  {protocol.releasePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {protocol.releasePhotos.map((photo, index) => (
                        <div key={`${photo}-${index}`} className="relative group">
                          <img src={photo} alt="Zdjęcie wydania" className="h-24 w-full rounded-md object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto('release', index)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Na telefonie możesz od razu zrobić zdjęcie lub wybrać je z galerii.
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button className="gradient-brand shadow-button" onClick={handleSaveProtocol}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz protokół
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Generuj PDF / drukuj
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={!!signatureTarget} onOpenChange={(open) => !open && setSignatureTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {signatureTarget === 'client' ? 'Podpis klienta' : 'Podpis pracownika'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border rounded-md bg-white">
              <canvas
                ref={signatureCanvasRef}
                className="w-full h-72 touch-none"
                style={{ touchAction: 'none' }}
                onPointerDown={handleSignaturePointerDown}
                onPointerMove={handleSignaturePointerMove}
                onPointerUp={endSignature}
                onPointerCancel={endSignature}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Podpisz palcem lub rysikiem. Możesz wyczyścić i spróbować ponownie.
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={clearSignature}>
                  Wyczyść
                </Button>
                <Button onClick={saveSignature}>Zapisz podpis</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
