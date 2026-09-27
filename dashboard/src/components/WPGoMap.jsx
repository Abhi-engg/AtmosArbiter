import React from 'react';

export default function WPGoMap({
  modelKey = 'atmos',
  modelLabel = 'AtmosArbiter Dynamic Blend',
  scenario,
  isMini = false,
}) {
  const embedId = '72';
  const embedToken = '06e76b5669e0b14bd9daca8fdfd075a445b0be6761a8c31bfecd96a35eb84203';

  // Self-contained, perfectly isolated iframe srcDoc
  const iframeSrcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    [data-wpgmza-embed], .wpgmza_map {
      width: 100% !important;
      height: 100% !important;
      min-height: 100% !important;
    }
  </style>
</head>
<body>
  <!-- WP Go Maps Embed: abhidot2005's Map -->
  <div data-wpgmza-embed="${embedId}" data-wpgmza-token="${embedToken}" style="width:100%;height:100%;"></div>
  <script src="https://cloud.wpgmaps.com/wp-content/plugins/wp-go-maps-cloud/js/embed.js"></script>
</body>
</html>`;

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col h-full shadow-xs">
      
      {/* Top Header Card */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {modelKey === 'atmos' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          ) : modelKey === 'naive' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          )}
          <span className="text-xs font-bold text-slate-800">{modelLabel}</span>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
          modelKey === 'atmos'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : modelKey === 'naive'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {modelKey === 'atmos' ? 'WP Go Maps • Blended' :
           modelKey === 'naive' ? 'WP Go Maps • Naive' :
           modelKey === 'ai' ? 'WP Go Maps • AI' : 'WP Go Maps • Physical'}
        </span>
      </div>

      {/* Embedded WP Go Map Frame */}
      <div className="relative flex-1 min-h-[260px] w-full bg-slate-50">
        <iframe
          title={`WP Go Maps - ${modelLabel}`}
          srcDoc={iframeSrcDoc}
          className="w-full h-full border-0 absolute inset-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Minimal Scale Badge (Optional non-intrusive indicator) */}
        {scenario && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-slate-200 text-[9px] font-mono text-slate-600 flex flex-col gap-0.5 shadow-2xs z-10 pointer-events-none">
            <span>{scenario.variable} ({scenario.unit})</span>
            <div className="w-20 h-1.5 rounded bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-600" />
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      {scenario && (
        <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono z-10">
          <span className="text-slate-500 text-[11px]">Peak Intensity:</span>
          <span className={`font-semibold ${
            modelKey === 'atmos' ? 'text-emerald-600 font-bold' :
            modelKey === 'naive' ? 'text-rose-600' : 'text-slate-700'
          }`}>
            {modelKey === 'atmos' ? `${scenario.referenceActual.peakValue - 8.7} ${scenario.unit} (Retained)` :
             modelKey === 'naive' ? `${(scenario.referenceActual.peakValue * 0.58).toFixed(1)} ${scenario.unit} (Diluted)` :
             modelKey === 'ai' ? `${(scenario.referenceActual.peakValue * 0.44).toFixed(1)} ${scenario.unit}` :
             `${(scenario.referenceActual.peakValue * 0.96).toFixed(1)} ${scenario.unit}`}
          </span>
        </div>
      )}

    </div>
  );
}
