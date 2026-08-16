import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { opmlApi } from '../api/opml';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [importStatus, setImportStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');

  const handleExportOpml = async () => {
    try {
      const opml = await opmlApi.exportOpml();
      const blob = new Blob([opml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscriptions.opml';
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Exported successfully!');
    } catch {
      setExportStatus('Export failed');
    }
  };

  const handleImportOpml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const result = await opmlApi.importOpml(content);
        setImportStatus(`Imported ${result.imported} feeds. ${result.errors.length} errors.`);
      } catch {
        setImportStatus('Import failed');
      }
    };
    reader.readAsText(file);
  };

  if (!settings) return null;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Settings</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Display</h3>
        <div className={styles.setting}>
          <label className={styles.label}>
            View Mode
            <select
              value={settings.viewMode}
              onChange={(e) => updateSettings({ viewMode: e.target.value as 'list' | 'expanded' })}
              className={styles.select}
            >
              <option value="list">List View</option>
              <option value="expanded">Expanded View</option>
            </select>
          </label>
        </div>
        <div className={styles.setting}>
          <label className={styles.label}>
            Theme
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
              className={styles.select}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Offline Storage</h3>
        <div className={styles.setting}>
          <label className={styles.label}>
            Retention Period
            <select
              value={settings.offlineRetention}
              onChange={(e) => updateSettings({ offlineRetention: parseInt(e.target.value, 10) })}
              className={styles.select}
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Subscriptions</h3>
        <div className={styles.opmlControls}>
          <button onClick={handleExportOpml} className={styles.button}>
            Export OPML
          </button>
          <label className={styles.fileLabel}>
            Import OPML
            <input type="file" accept=".opml,.xml" onChange={handleImportOpml} className={styles.fileInput} />
          </label>
        </div>
        {importStatus && <p className={styles.status}>{importStatus}</p>}
        {exportStatus && <p className={styles.status}>{exportStatus}</p>}
      </section>
    </div>
  );
}
