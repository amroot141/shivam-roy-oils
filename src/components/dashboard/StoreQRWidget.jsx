import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, ExternalLink, Sparkles } from 'lucide-react';

export function StoreQRWidget({ storeSettings }) {
  const checkoutUrl = `${window.location.origin}/checkout`;

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the Store QR Poster');
      return;
    }

    const storeName = storeSettings?.store_name || 'Shivam Roy Oils';
    const storeAddress = storeSettings?.address || 'Shop 14, Kisan Mandi Complex';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Store Self-Checkout QR Poster - ${storeName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=Inter:wght@400;600&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
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
              border: 8px solid #d97706;
              border-radius: 32px;
              padding: 40px 30px;
              text-align: center;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .brand-badge {
              display: inline-block;
              background: #d97706;
              color: white;
              font-family: 'Outfit', sans-serif;
              font-weight: 800;
              font-size: 28px;
              width: 54px;
              height: 54px;
              line-height: 54px;
              border-radius: 18px;
              margin-bottom: 12px;
            }
            h1 {
              font-family: 'Outfit', sans-serif;
              font-size: 24px;
              font-weight: 800;
              color: #1c1917;
              margin: 0 0 6px 0;
            }
            .address {
              font-size: 13px;
              color: #78716c;
              margin-bottom: 24px;
            }
            .qr-box {
              display: inline-block;
              padding: 20px;
              background: #fffbeb;
              border: 2px dashed #f59e0b;
              border-radius: 24px;
              margin-bottom: 24px;
            }
            .tagline {
              font-size: 18px;
              font-weight: 700;
              color: #b45309;
              margin-bottom: 8px;
            }
            .instructions {
              font-size: 13px;
              color: #57534e;
              line-height: 1.5;
            }
            .url {
              margin-top: 20px;
              font-family: monospace;
              font-size: 12px;
              color: #a8a29e;
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="brand-badge">S</div>
            <h1>${storeName}</h1>
            <p class="address">${storeAddress}</p>
            
            <div class="qr-box">
              <svg width="220" height="220" viewBox="0 0 220 220">
                ${document.getElementById('checkout-svg-qr')?.innerHTML || ''}
              </svg>
            </div>

            <p class="tagline">SCAN FOR SELF-CHECKOUT</p>
            <p class="instructions">
              Skip the counter line! Scan this code on your phone, choose your items, 
              leave quick feedback, and <strong>unlock instant store discounts!</strong>
            </p>
            <p class="url">${checkoutUrl}</p>
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
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-stone-400 hover:text-amber-700 flex items-center gap-1 mt-1 truncate max-w-xs"
          >
            <span>{checkoutUrl}</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePrintQR}
        className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer mt-2"
      >
        <Printer size={15} />
        <span>Print Store QR Poster</span>
      </button>
    </div>
  );
}
