'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  Palette,
  Info,
  ImageIcon,
  FileText,
  Save,
} from 'lucide-react';
import { PageHeader, Button } from './ui';
import { cn } from '../lib/utils';

interface CmsSettings {
  logoUrl: string;
  bannerUrl: string;
  themeColor: 'primary' | 'secondary';
  termsAndConditions: string;
  privacyPolicy: string;
  deliveryPolicy: string;
}

type CmsSection = 'appearance' | 'legal';

const themeOptions = [
  { id: 'primary' as const, name: 'Azul turquesa', swatch: 'bg-primary-500' },
  { id: 'secondary' as const, name: 'Verde', swatch: 'bg-secondary-500' },
];

const themePreviewClasses = {
  primary: {
    badge: 'bg-primary-600',
    iconBox: 'bg-primary-550/15 border-primary-550/20',
    icon: 'text-primary-400',
    glow: 'bg-primary-500/10',
  },
  secondary: {
    badge: 'bg-secondary-600',
    iconBox: 'bg-secondary-550/15 border-secondary-550/20',
    icon: 'text-secondary-400',
    glow: 'bg-secondary-500/10',
  },
} as const;

const DEFAULT_TERMS = `Términos y Condiciones del Servicio:
1. Aceptación de los Términos: Al acceder y utilizar este portal de salud digital, el usuario acepta de manera explícita los términos de servicio expuestos en el presente acuerdo.
2. Prescripción Médica: La compra de medicamentos controlados requerirá de la validación física u homologación digital del récipe emitido por un médico colegiado verificado en Zenith OMS.
3. Descuentos y Promociones: Los descuentos otorgados son exclusivos del programa de incentivos del médico tratante y no son transferibles.`;

const DEFAULT_PRIVACY = `Políticas de Privacidad y Consentimiento de Datos:
De conformidad con las leyes de protección de datos de salud y regulaciones de secreto médico, toda la información de diagnóstico y recetas emitidas se almacena de forma encriptada de punto a punto y no es compartida con entidades de mercadotecnia de terceros.`;

const sectionTabs: { id: CmsSection; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'legal', label: 'Textos legales', icon: FileText },
];

export default function CmsView() {
  const [settings, setSettings] = useState<CmsSettings>({
    logoUrl: '/images/default-logo.png',
    bannerUrl: '/images/default-banner.jpg',
    themeColor: 'primary',
    termsAndConditions: DEFAULT_TERMS,
    privacyPolicy: DEFAULT_PRIVACY,
    deliveryPolicy:
      'Las entregas a domicilio estándar se procesan en un lapso de 24 horas hábiles a partir de la confirmación del pago en la plataforma.',
  });

  const [activeSection, setActiveSection] = useState<CmsSection>('appearance');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoFileName, setLogoFileName] = useState('logo_zenith_vector.png');
  const [bannerFileName, setBannerFileName] = useState('banner_promocional.jpg');

  useEffect(() => {
    const localCms = localStorage.getItem('zenith_cms_settings');
    if (localCms) {
      const parsed = JSON.parse(localCms) as CmsSettings & { themeColor?: string };
      const themeColor = parsed.themeColor === 'secondary' ? 'secondary' : 'primary';
      setSettings({ ...parsed, themeColor });
    }
  }, []);

  const handleImageUpload = (
    file: File,
    field: 'logoUrl' | 'bannerUrl',
    setFileName: (name: string) => void
  ) => {
    const objectUrl = URL.createObjectURL(file);
    setSettings((prev) => ({ ...prev, [field]: objectUrl }));
    setFileName(file.name);
  };

  const handlePublish = () => {
    localStorage.setItem('zenith_cms_settings', JSON.stringify(settings));
    localStorage.setItem('zenith_terms_conditions', settings.termsAndConditions);
    window.dispatchEvent(new Event('zenith_cms_update'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const previewTheme = themePreviewClasses[settings.themeColor];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal del paciente"
        description="Define la apariencia y los textos que verán médicos y pacientes."
        actions={
          <Button size="sm" onClick={handlePublish}>
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        }
      />

      {saveSuccess && (
        <div className="p-3.5 bg-secondary-500/10 border border-secondary-500/25 rounded-xl flex items-center gap-2 text-secondary-450 text-xs">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong className="font-bold">Cambios guardados.</strong> Se aplicarán en el portal del
            paciente.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-surface-800 pb-1">
        {sectionTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSection(id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer',
              activeSection === id
                ? 'text-foreground border-primary-500'
                : 'text-surface-500 border-transparent hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'appearance' ? (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 space-y-5">
            <section className="zenith-panel space-y-4">
              <div>
                <h3 className="zenith-section-title">Color del portal</h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Elige el color principal de botones y destacados.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, themeColor: theme.id }))}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-left',
                      settings.themeColor === theme.id
                        ? 'bg-surface-850 border-primary-500 text-foreground ring-1 ring-primary-500/30'
                        : 'bg-surface-950 border-surface-800 text-surface-500 hover:border-surface-700 hover:text-foreground'
                    )}
                  >
                    <span className={cn('h-8 w-8 rounded-lg shrink-0', theme.swatch)} />
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="zenith-panel space-y-4">
              <div>
                <h3 className="zenith-section-title">Logotipo</h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Imagen que aparece en el encabezado del portal.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center shrink-0 overflow-hidden">
                  <ImageIcon className="h-7 w-7 text-surface-500" />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <p className="text-xs text-surface-400 truncate">{logoFileName}</p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-850 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Subir logotipo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'logoUrl', setLogoFileName);
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-surface-500">PNG, JPG o SVG. Máximo 5 MB.</p>
                </div>
              </div>
            </section>

            <section className="zenith-panel space-y-4">
              <div>
                <h3 className="zenith-section-title">Banner principal</h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Imagen promocional en la pantalla de inicio del paciente.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-surface-400 truncate">{bannerFileName}</p>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-950 border border-surface-800 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-850 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Subir banner
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'bannerUrl', setBannerFileName);
                    }}
                  />
                </label>
                <p className="text-[10px] text-surface-500">PNG o JPG. Máximo 5 MB.</p>
              </div>
            </section>
          </div>

          <aside className="xl:col-span-2">
            <div className="zenith-panel space-y-4 sticky top-6">
              <div>
                <h3 className="zenith-section-title">Vista previa</h3>
                <p className="text-xs text-surface-500 mt-0.5">Así se verá el banner del paciente.</p>
              </div>
              <div className="relative rounded-xl bg-primary-900/60 border border-primary-500/10 overflow-hidden p-5 min-h-[140px] flex flex-col justify-between">
                <div className="space-y-2 relative z-10">
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white',
                      previewTheme.badge
                    )}
                  >
                    Beneficio activo
                  </span>
                  <p className="text-sm font-bold text-foreground leading-snug">
                    Su médico le ha otorgado descuentos exclusivos
                  </p>
                  <p className="text-[10px] text-surface-500">
                    Canjee su receta en cualquier sucursal de la red.
                  </p>
                </div>
                <div
                  className={cn(
                    'absolute right-4 bottom-4 h-14 w-14 rounded-xl border flex items-center justify-center',
                    previewTheme.iconBox
                  )}
                >
                  <Palette className={cn('h-7 w-7', previewTheme.icon)} />
                </div>
                <div
                  className={cn(
                    'absolute -right-8 -bottom-8 h-28 w-28 rounded-full blur-xl',
                    previewTheme.glow
                  )}
                />
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="max-w-3xl space-y-5">
          <section className="zenith-panel space-y-5">
            <div>
              <h3 className="zenith-section-title">Textos legales</h3>
              <p className="text-xs text-surface-500 mt-0.5">
                El paciente debe aceptarlos antes de confirmar un pedido.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="zenith-field-label" htmlFor="cms-terms">
                Términos y condiciones
              </label>
              <textarea
                id="cms-terms"
                rows={5}
                value={settings.termsAndConditions}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, termsAndConditions: e.target.value }))
                }
                className="zenith-input px-3.5 py-2.5 leading-relaxed resize-y min-h-[120px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="zenith-field-label" htmlFor="cms-privacy">
                Política de privacidad
              </label>
              <textarea
                id="cms-privacy"
                rows={4}
                value={settings.privacyPolicy}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, privacyPolicy: e.target.value }))
                }
                className="zenith-input px-3.5 py-2.5 leading-relaxed resize-y min-h-[100px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="zenith-field-label" htmlFor="cms-delivery">
                Política de entregas
              </label>
              <textarea
                id="cms-delivery"
                rows={3}
                value={settings.deliveryPolicy}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, deliveryPolicy: e.target.value }))
                }
                className="zenith-input px-3.5 py-2.5 leading-relaxed resize-y min-h-[80px]"
              />
            </div>

            <div className="p-3 bg-surface-950 border border-surface-800 rounded-xl flex items-start gap-2 text-[11px] text-surface-500">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-surface-400" />
              <span>
                Si modificas estos textos, el paciente tendrá que volver a aceptar los términos en su
                próximo pedido.
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
