import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, ExternalLink, Sparkles, Download, Check } from 'lucide-react';

export function StoreQRWidget({ storeSettings }) {
  const checkoutUrl = `${window.location.origin}/checkout`;
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const storeName = storeSettings?.store_name || 'Shivam Roy Oils';
  const storeTagline = storeSettings?.tagline || 'Farm-Fresh Cold Pressed Oils & Spices';
  const storeAddress = storeSettings?.address || 'Shop 14, Kisan Mandi Complex, Ring Road';
  const storePhone = storeSettings?.phone || '+91 98765 01234';
  const storeInitial = storeName.charAt(0).toUpperCase() || 'S';

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the Store QR Poster');
      return;
    }

    const qrElement = document.getElementById('checkout-svg-qr')?.innerHTML || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Store Self-Checkout QR Poster - ${storeName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;800;900&family=Inter:wght@400;500;600;700&display=swap');
            * { box-sizing: border-box; }
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f8fafc;
            }
            .poster {
              width: 100%;
              max-width: 480px;
              background: white;
              border: 10px solid #d97706;
              border-radius: 36px;
              padding: 44px 32px;
              text-align: center;
              box-shadow: 0 25px 35px -5px rgba(0, 0, 0, 0.12);
            }
            .brand-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: white;
              font-family: 'Outfit', sans-serif;
              font-weight: 900;
              font-size: 32px;
              width: 60px;
              height: 60px;
              border-radius: 20px;
              margin-bottom: 14px;
              box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.3);
            }
            h1 {
              font-family: 'Outfit', sans-serif;
              font-size: 26px;
              font-weight: 800;
              color: #1c1917;
              margin: 0 0 6px 0;
            }
            .tagline {
              font-size: 14px;
              color: #d97706;
              font-weight: 700;
              margin: 0 0 8px 0;
              letter-spacing: 0.5px;
            }
            .address {
              font-size: 12px;
              color: #78716c;
              margin-bottom: 24px;
              line-height: 1.4;
            }
            .qr-box {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              background: #fffbeb;
              border: 3px dashed #f59e0b;
              border-radius: 28px;
              margin-bottom: 24px;
            }
            .qr-box svg {
              width: 220px;
              height: 220px;
            }
            .action-banner {
              background: #1c1917;
              color: #fef3c7;
              font-family: 'Outfit', sans-serif;
              font-size: 18px;
              font-weight: 800;
              padding: 10px 18px;
              border-radius: 16px;
              display: inline-block;
              margin-bottom: 12px;
              letter-spacing: 0.5px;
            }
            .instructions {
              font-size: 13px;
              color: #57534e;
              line-height: 1.6;
              max-width: 360px;
              margin: 0 auto;
            }
            .instructions strong {
              color: #b45309;
            }
            .footer-info {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px dashed #e7e5e4;
              font-size: 11px;
              color: #a8a29e;
            }
            .footer-info .phone {
              font-weight: 600;
              color: #44403c;
              margin-bottom: 4px;
            }
            .footer-info .url {
              font-family: monospace;
              word-break: break-all;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .poster {
                box-shadow: none;
                border-width: 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="brand-badge">${storeInitial}</div>
            <h1>${storeName}</h1>
            <p class="tagline">${storeTagline}</p>
            <p class="address">${storeAddress}</p>
            
            <div class="qr-box">
              ${qrElement}
            </div>

            <div>
              <div class="action-banner">⚡ SCAN TO SELF-CHECKOUT</div>
            </div>
            
            <p class="instructions">
              Skip the cashier queue! Scan this QR code with your phone camera, pick your items, 
              give instant feedback &amp; <strong>unlock special store discounts!</strong>
            </p>

            <div class="footer-info">
              <div class="phone">Store Helpdesk: ${storePhone}</div>
              <div class="url">${checkoutUrl}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPoster = async () => {
    try {
      setDownloading(true);
      const canvas = document.createElement('canvas');
      const width = 800;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Outer Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 16;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner Accent
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Header Badge Circle
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(width / 2, 120, 42, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(storeInitial, width / 2, 122);

      // Store Name
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(storeName, width / 2, 200);

      // Store Tagline
      ctx.fillStyle = '#b45309';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(storeTagline, width / 2, 240);

      // Address
      ctx.fillStyle = '#78716c';
      ctx.font = '16px sans-serif';
      ctx.fillText(storeAddress, width / 2, 275);

      // QR Code Box
      const qrBoxSize = 340;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = 320;
      
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

      // Get SVG QR element
      const svgEl = document.querySelector('#checkout-svg-qr svg');
      if (svgEl) {
        const svgString = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, qrBoxX + 25, qrBoxY + 25, qrBoxSize - 50, qrBoxSize - 50);
            URL.revokeObjectURL(blobURL);
            resolve();
          };
          img.src = blobURL;
        });
      }

      // Action Banner Box
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect((width - 460) / 2, 700, 460, 56, 16);
      ctx.fill();

      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('⚡ SCAN TO SELF-CHECKOUT', width / 2, 735);

      // Instructions
      ctx.fillStyle = '#44403c';
      ctx.font = '500 18px sans-serif';
      ctx.fillText('Skip the counter queue! Scan with your smartphone camera,', width / 2, 800);
      ctx.fillText('pick your items & unlock exclusive discounts!', width / 2, 830);

      // Footer
      ctx.fillStyle = '#a8a29e';
      ctx.font = '15px sans-serif';
      ctx.fillText(`Store Assistance: ${storePhone}`, width / 2, 920);
      ctx.font = '13px monospace';
      ctx.fillText(checkoutUrl, width / 2, 950);

      // Download
      const link = document.createElement('a');
      link.download = `${storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-checkout-poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Error creating poster image:', err);
      alert('Could not generate poster image download. Please use the Print option.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-amber-600" />
            <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg">
              Customer Self-Checkout QR
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Counter Poster
          </span>
        </div>

        <div className="flex flex-col items-center py-4 text-center">
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl shadow-inner mb-3">
            <div id="checkout-svg-qr">
              <QRCodeSVG
                value={checkoutUrl}
                size={140}
                level="H"
                includeMargin={true}
                fgColor="#1c1917"
              />
            </div>
          </div>

          <p className="text-xs font-bold text-stone-900 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-600" />
            <span>Scan to Checkout &amp; Unlock Discounts</span>
          </p>
          <p className="text-[11px] text-stone-500 font-medium mt-0.5 max-w-xs truncate">
            {storeName} • {storePhone}
          </p>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-stone-400 hover:text-amber-700 flex items-center gap-1 mt-1 truncate max-w-xs transition-colors"
          >
            <span>{checkoutUrl}</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          type="button"
          onClick={handlePrintQR}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Printer size={14} />
          <span>Print Poster</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadPoster}
          disabled={downloading}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {downloaded ? (
            <>
              <Check size={14} className="text-emerald-300" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>{downloading ? 'Preparing...' : 'Download PNG'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
