import React from 'react';
import { Quotation, QuotationItem } from '../../../types';
import { splitRupeesPaise, formatDateIndian } from '../../../utils/helpers';
import { Phone, MapPin, Mail } from 'lucide-react';

interface QuotationTemplateProps {
  quotation: Quotation;
  id?: string;
}

export const QuotationTemplate: React.FC<QuotationTemplateProps> = ({
  quotation,
  id = 'a4-quotation-render'
}) => {
  const subtotalParts = splitRupeesPaise(quotation.subtotal || 0);
  const cgstParts = splitRupeesPaise(quotation.cgst_amount || 0);
  const sgstParts = splitRupeesPaise(quotation.sgst_amount || 0);
  const igstParts = splitRupeesPaise(quotation.igst_amount || 0);
  const totalParts = splitRupeesPaise(quotation.total_amount || 0);

  // Address lines
  const addressLines = (quotation.customer_address || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const addrLine1 = addressLines[0] || '';
  const addrLine2 = addressLines.slice(1).join(', ') || '';

  const items = quotation.items || [];
  const formattedDate =
    formatDateIndian(quotation.quotation_date) ||
    quotation.quotation_date ||
    new Date().toISOString().slice(0, 10);

  const isIntraState = quotation.tax_type === 'intra_state' || !quotation.tax_type;
  const isInterState = quotation.tax_type === 'inter_state';
  const hasTax = quotation.tax_type !== 'none';

  // Svg Corner Decorations (Matching Physical Printed Bill Stationery)
  const renderSvgDecorations = () => (
    <>
      {/* Top Right Corner */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '80px', height: '52px', zIndex: 0 }}
        viewBox="0 0 80 52"
        fill="none"
      >
        <polygon points="42,0 80,0 80,30" fill="#082138" />
        <polygon points="12,0 35,0 80,38 80,48 70,48 5,0" fill="#008CD6" />
      </svg>
      {/* Bottom Right Corner */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{ width: '150px', height: '60px', zIndex: 0 }}
        viewBox="0 0 150 60"
        fill="none"
      >
        <polygon points="150,18 150,60 95,60" fill="#082138" />
        <polygon points="150,0 150,11 75,60 48,60 132,0" fill="#008CD6" />
      </svg>
      {/* Bottom Left Corner */}
      <svg
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: '160px', height: '55px', zIndex: 0 }}
        viewBox="0 0 160 55"
        fill="none"
      >
        <path d="M 0 55 L 0 20 C 35 32, 85 45, 160 55 Z" fill="#008CD6" />
        <path d="M 0 55 L 0 38 C 25 45, 60 50, 105 55 Z" fill="#082138" />
      </svg>
    </>
  );

  // Full Brand Header
  const renderFullBrandHeader = () => (
    <div className="flex items-start justify-between mb-2">
      {/* Left: Industrial Cogwheel Logo + Brand Name */}
      <div className="flex items-center gap-3.5">
        <div className="w-[72px] h-[72px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <g fill="#082138">
              {[...Array(12)].map((_, i) => (
                <rect
                  key={i}
                  x="44"
                  y="3"
                  width="12"
                  height="13"
                  rx="2"
                  transform={`rotate(${i * 30} 50 50)`}
                />
              ))}
              <circle cx="50" cy="50" r="41" />
            </g>
            <circle cx="50" cy="50" r="33" fill="#008CD6" />
            <circle cx="50" cy="50" r="28" fill="#ffffff" />
            <circle cx="50" cy="50" r="25" fill="#082138" />
            <text
              x="50"
              y="59"
              fill="#ffffff"
              fontSize="28"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="Inter, Arial, sans-serif"
            >
              M
            </text>
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-black text-[34px] tracking-tight text-[#082138] leading-none" style={{ fontWeight: 900 }}>
            MURTHI
          </h1>
          <h2 className="font-black text-[27px] tracking-tight text-[#008CD6] leading-none mt-1" style={{ fontWeight: 900 }}>
            MACHIN WORKS
          </h2>
          <div className="text-[8.5px] font-semibold text-slate-800 leading-[1.25] mt-1.5">
            <p>Machinery Merchants for Industrial use, New, Old &amp;</p>
            <p>Recondition Works, Textile &amp; Fabrications Works</p>
          </div>
        </div>
      </div>

      {/* Right: Contact Details */}
      <div className="text-[8px] text-slate-800 space-y-1 max-w-[325px] pr-4 pt-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#082138] text-white flex items-center justify-center shrink-0">
            <Phone className="w-2.5 h-2.5" />
          </div>
          <span className="font-extrabold text-[#082138] text-[9.5px]">
            Cell: 98422 66521, 87783 84248
          </span>
        </div>
        <div className="flex items-start gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#082138] text-white flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />
          </div>
          <div className="leading-[1.22] text-slate-700 font-medium">
            <p>21A, Rajaji Nagar, Iyer Hospital Bus Stop, Singanallur, Coimbatore-641 005.</p>
            <p>No. 45, South Street No. 1, Avarampalayam, Coimbatore-641 006.</p>
            <p>Sf.No.215/4C1, Irugur Main Road, Ondipudur, Meena Furniture Opp, Coimbatore-641 016.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#082138] text-white flex items-center justify-center shrink-0">
            <Mail className="w-2.5 h-2.5" />
          </div>
          <span className="font-medium text-slate-800">
            <strong className="font-bold text-[#082138]">Email :</strong> murthimachinworks@gmail.com
          </span>
        </div>
      </div>
    </div>
  );

  // Compact Continuation Brand Header (for Page 2)
  const renderContinuationHeader = (pageNumber: number, totalPages: number) => (
    <div className="flex items-center justify-between border-b-2 border-[#082138] pb-2 mb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-[38px] h-[38px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#082138" />
            <circle cx="50" cy="50" r="33" fill="#008CD6" />
            <circle cx="50" cy="50" r="28" fill="#ffffff" />
            <circle cx="50" cy="50" r="25" fill="#082138" />
            <text x="50" y="59" fill="#ffffff" fontSize="28" fontWeight="900" textAnchor="middle">
              M
            </text>
          </svg>
        </div>
        <div>
          <h2 className="font-black text-[18px] text-[#082138] leading-none">
            MURTHI MACHIN WORKS
          </h2>
          <p className="text-[9px] font-bold text-[#008CD6] tracking-wider mt-0.5">
            QUOTATION — CONTINUATION SHEET (PAGE {pageNumber} OF {totalPages})
          </p>
        </div>
      </div>
      <div className="text-right text-[9.5px] space-y-0.5 text-slate-800">
        <div>
          <span className="text-slate-500 font-semibold">Quotation No:</span>{' '}
          <strong className="font-mono text-[#082138] font-bold">{quotation.quotation_number}</strong>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Messers:</span>{' '}
          <strong className="text-slate-900">{quotation.customer_name}</strong>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Date:</span>{' '}
          <strong className="font-mono text-slate-900">{formattedDate}</strong>
        </div>
      </div>
    </div>
  );

  // Quotation Banner Ribbon & GSTIN
  const renderQuotationBanner = () => (
    <div className="relative flex items-center justify-between h-[46px] overflow-hidden rounded-xs mb-2">
      <div className="relative flex items-center h-full w-[380px]">
        <svg width="380" height="46" viewBox="0 0 380 46" className="absolute left-0 top-0">
          <polygon points="0,0 380,0 330,46 0,46" fill="#082138" />
        </svg>
        <div className="relative z-10 pl-6 pr-12 text-white">
          <h3 className="font-black text-[25px] tracking-wider leading-none text-white font-sans">
            QUOTATION
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-[8px] font-bold tracking-[0.22em] text-white/95">
            <span className="w-6 h-px bg-white/70 inline-block" />
            <span>QUALITY</span>
            <span>|</span>
            <span>SERVICE</span>
            <span>|</span>
            <span>TRUST</span>
            <span className="w-6 h-px bg-white/70 inline-block" />
          </div>
        </div>
      </div>
      <div className="text-right pr-3">
        <span className="text-[13.5px] font-black text-[#082138] tracking-wider">
          GSTIN No: 33ALVPM1230G1Z8
        </span>
      </div>
    </div>
  );

  // No & Date Row
  const renderNoAndDateRow = () => (
    <div className="flex items-center justify-between px-1 text-[11.5px] font-bold text-slate-900 mb-2">
      <div className="flex items-baseline gap-2 flex-1 max-w-[360px]">
        <span className="font-bold text-slate-950 shrink-0">No. :</span>
        <div className="border-b border-slate-700 flex-1 pb-0.5 font-bold font-mono text-[11.5px] text-slate-950 pl-2">
          {quotation.quotation_number || 'MMW/QTN/2026-27/001'}
        </div>
      </div>
      <div className="flex items-baseline gap-2 flex-1 max-w-[300px] justify-end">
        <span className="font-bold text-slate-950 shrink-0">Date :</span>
        <div className="border-b border-slate-700 min-w-[200px] pb-0.5 text-center font-bold font-mono text-[11.5px] text-slate-950">
          {formattedDate}
        </div>
      </div>
    </div>
  );

  // Customer Details Box (Messers)
  const renderCustomerBox = () => (
    <div
      className="rounded-lg p-2.5 space-y-2 mb-2"
      style={{
        border: '1.4px solid #9CCBF0',
        backgroundColor: '#F4F9FD'
      }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-[#082138] text-[12px] shrink-0">Messers.</span>
        <div className="border-b border-slate-400 flex-1 pb-0.5 font-bold text-[12px] text-slate-950 pl-2 min-h-[18px]">
          {quotation.customer_name || ''}
        </div>
      </div>
      <div className="border-b border-slate-400 min-h-[18px] text-[10.5px] text-slate-800 font-medium pl-16 pb-0.5">
        {addrLine1}
      </div>
      <div className="flex items-baseline gap-4">
        <div className="border-b border-slate-400 flex-1 min-h-[18px] text-[10.5px] text-slate-800 font-medium pl-16 pb-0.5">
          {addrLine2 || (quotation.customer_phone ? `Phone: ${quotation.customer_phone}` : '')}
        </div>
        <div className="flex items-baseline gap-1.5 w-[240px] shrink-0">
          <span className="font-bold text-[#082138] text-[11.5px] shrink-0">GSTIN :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[18px] font-bold font-mono text-[11.5px] text-slate-950 pl-1.5 pb-0.5">
            {quotation.customer_gstin || ''}
          </div>
        </div>
      </div>
    </div>
  );

  // Commercial Terms Grid Box
  const renderTermsGrid = () => (
    <div
      className="rounded-lg p-2.5 text-[9.5px] mb-2"
      style={{
        border: '1.4px solid #9CCBF0',
        backgroundColor: '#F4F9FD'
      }}
    >
      <div className="grid grid-cols-12 gap-x-3.5 gap-y-2 items-center">
        <div className="col-span-5 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Your Enquiry Ref :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 font-mono text-[10px]">
            {quotation.notes || 'Direct Enquiry'}
          </div>
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Dated :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 font-mono text-[10px]">
            {formattedDate}
          </div>
        </div>
        <div className="col-span-4 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Quotation Validity :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 text-[10px]">
            15 Days from Date
          </div>
        </div>
        <div className="col-span-5 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Payment Terms :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-medium text-slate-900 text-[9.5px]">
            50% Advance &amp; Balance on Dispatch
          </div>
        </div>
        <div className="col-span-4 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Delivery Timeline :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-medium text-slate-900 text-[9.5px]">
            Ready Stock / 7 to 10 Days
          </div>
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Price Basis :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 text-[10px]">
            Ex-Works Coimbatore
          </div>
        </div>
        <div className="col-span-5 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Taxes &amp; Duties :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 text-[10px]">
            {hasTax ? (isIntraState ? 'GST 18% (CGST 9% + SGST 9%)' : 'GST 18% (IGST 18%)') : 'Zero Tax / As Applicable'}
          </div>
        </div>
        <div className="col-span-7 flex items-center gap-1.5">
          <span className="font-bold text-[#082138] shrink-0">Packing &amp; Freight :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 text-[10px]">
            Extra at actuals / To Pay Basis through customer carrier
          </div>
        </div>
      </div>
    </div>
  );

  // Machinery Table Rows
  const renderTable = (
    itemsList: QuotationItem[],
    startIdx: number,
    minHeightPx: number,
    isContinuationPage: boolean = false,
    showContinuationNotice: boolean = false
  ) => {
    const estimatedRowHeightPx = 32;
    const contentHeightPx = itemsList.length * estimatedRowHeightPx;
    const fillerHeightPx = Math.max(0, minHeightPx - contentHeightPx);

    return (
      <div className="overflow-hidden bg-white mb-2" style={{ border: '1.6px solid #082138' }}>
        {/* Table Header */}
        <div className="bg-[#082138] text-white font-bold h-[34px] flex items-stretch text-[10px]">
          <div className="w-[50px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold">
            Sl.No
          </div>
          <div className="w-[305px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold">
            Particulars
          </div>
          <div className="w-[78px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold">
            HSN Code
          </div>
          <div className="w-[108px] shrink-0 border-r border-white/40 flex flex-col justify-center text-center">
            <div className="border-b border-white/40 pb-0.5 font-bold">Rate</div>
            <div className="flex items-stretch text-[9px] pt-0.5 h-[16px]">
              <span className="w-[68px] shrink-0 border-r border-white/40 font-semibold flex items-center justify-center">Rs.</span>
              <span className="w-[40px] shrink-0 font-semibold flex items-center justify-center">Ps.</span>
            </div>
          </div>
          <div className="w-[55px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold">
            Qty
          </div>
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="border-b border-white/40 pb-0.5 font-bold">Amount</div>
            <div className="flex items-stretch text-[9px] pt-0.5 h-[16px]">
              <span className="flex-1 border-r border-white/40 font-semibold flex items-center justify-center">Rs.</span>
              <span className="w-[42px] shrink-0 font-semibold flex items-center justify-center">Ps.</span>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col bg-white" style={{ minHeight: `${minHeightPx}px` }}>
          {itemsList.map((item, idx) => {
            const rateParts = splitRupeesPaise(item.rate || 0);
            const amountParts = splitRupeesPaise(item.amount || 0);

            return (
              <div
                key={item.id || idx}
                className="flex items-stretch border-b border-slate-200 min-h-[30px]"
              >
                <div className="w-[50px] shrink-0 border-r border-slate-300 flex items-center justify-center font-bold text-slate-900 text-[10.5px] py-1.5 bg-white">
                  {startIdx + idx + 1}
                </div>
                <div className="w-[305px] shrink-0 border-r border-slate-300 px-2.5 py-1.5 flex flex-col justify-center text-left min-w-0 bg-white">
                  <span className="font-bold text-slate-950 text-[10.5px] leading-snug">
                    {item.product_description}
                  </span>
                  {item.serial_number && (
                    <span className="text-[8.5px] text-slate-600 font-mono mt-0.5">
                      S/N: {item.serial_number}
                    </span>
                  )}
                </div>
                <div className="w-[78px] shrink-0 border-r border-slate-300 flex items-center justify-center font-mono text-[9.5px] text-slate-800 font-medium py-1.5 bg-white">
                  {item.hsn_code || '84581100'}
                </div>
                <div className="w-[108px] shrink-0 border-r border-slate-300 flex items-stretch bg-white">
                  <div className="w-[68px] shrink-0 border-r border-slate-300 pr-2 py-1.5 flex items-center justify-end font-mono font-bold text-slate-900 text-[10px] whitespace-nowrap">
                    {rateParts.rs}
                  </div>
                  <div className="w-[40px] shrink-0 py-1.5 flex items-center justify-center font-mono text-[9px] text-slate-600">
                    {rateParts.ps}
                  </div>
                </div>
                <div className="w-[55px] shrink-0 border-r border-slate-300 flex items-center justify-center font-mono font-bold text-slate-950 text-[10px] py-1.5 bg-white">
                  {item.quantity}
                </div>
                <div className="flex-1 flex items-stretch bg-white">
                  <div className="flex-1 pr-2 py-1.5 flex items-center justify-end font-mono font-bold text-slate-900 text-[10.5px] whitespace-nowrap">
                    {amountParts.rs}
                  </div>
                  <div className="w-[42px] shrink-0 border-l border-slate-300 py-1.5 flex items-center justify-center font-mono text-[9px] text-slate-600">
                    {amountParts.ps}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continuous Vertical Lines Filler */}
          <div className="flex-1 flex items-stretch" style={{ minHeight: `${fillerHeightPx}px` }}>
            <div className="w-[50px] shrink-0 border-r border-slate-300" />
            <div className="w-[305px] shrink-0 border-r border-slate-300" />
            <div className="w-[78px] shrink-0 border-r border-slate-300" />
            <div className="w-[108px] shrink-0 border-r border-slate-300 flex items-stretch">
              <div className="w-[68px] shrink-0 border-r border-slate-300" />
              <div className="w-[40px] shrink-0" />
            </div>
            <div className="w-[55px] shrink-0 border-r border-slate-300" />
            <div className="flex-1 flex items-stretch">
              <div className="flex-1" />
              <div className="w-[42px] shrink-0 border-l border-slate-300" />
            </div>
          </div>
        </div>

        {/* Continuation Row (Notice at bottom of Page 1) */}
        {showContinuationNotice && (
          <div className="bg-[#082138] text-white px-4 py-2 flex items-center justify-between text-[11px] font-bold border-t border-slate-300">
            <span className="tracking-wide">Items Continued on Page 2 →</span>
            <span className="text-cyan-300 text-[10px] font-mono">Page 1 Total Items: {itemsList.length}</span>
          </div>
        )}
      </div>
    );
  };

  // Totals & Tax Breakdown Box
  const renderTotalsAndTax = () => (
    <div className="flex items-stretch border-t border-slate-400 bg-white">
      <div
        className="p-2.5 flex flex-col justify-between border-r border-slate-400 bg-white shrink-0"
        style={{ width: '433px' }}
      >
        <div>
          <span className="font-bold text-[#082138] text-[11.5px]">Rupees in Words :</span>
          <div className="mt-1 font-semibold text-[10.5px] text-slate-900 leading-snug italic pr-2">
            {quotation.rupees_in_words || '—'}
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          <div className="w-full border-b border-slate-300" />
          <div className="w-full border-b border-slate-300" />
        </div>
      </div>

      <div className="flex-1 text-[9.5px]">
        {/* Row 1: Amount Before Tax */}
        <div className="flex items-stretch border-b border-slate-300 h-[26px]">
          <div className="w-[136px] shrink-0 px-2 flex items-center font-bold text-slate-800 border-r border-slate-300 text-[9px] leading-tight">
            Quotation Amount Before Tax
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-bold text-slate-950 whitespace-nowrap min-w-0">
            {subtotalParts.rs}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {subtotalParts.ps}
          </div>
        </div>
        {/* Row 2: CGST */}
        <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
          <div className="w-[136px] shrink-0 px-2 flex items-center justify-between border-r border-slate-300">
            <span className="font-semibold">CGST</span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="text-slate-500">@</span>
              <span className="font-bold">{quotation.cgst_rate || 9}%</span>
            </div>
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900 whitespace-nowrap min-w-0">
            {hasTax && isIntraState ? cgstParts.rs : '0'}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {hasTax && isIntraState ? cgstParts.ps : '00'}
          </div>
        </div>
        {/* Row 3: SGST */}
        <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
          <div className="w-[136px] shrink-0 px-2 flex items-center justify-between border-r border-slate-300">
            <span className="font-semibold">SGST</span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="text-slate-500">@</span>
              <span className="font-bold">{quotation.sgst_rate || 9}%</span>
            </div>
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900 whitespace-nowrap min-w-0">
            {hasTax && isIntraState ? sgstParts.rs : '0'}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {hasTax && isIntraState ? sgstParts.ps : '00'}
          </div>
        </div>
        {/* Row 4: IGST */}
        <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
          <div className="w-[136px] shrink-0 px-2 flex items-center justify-between border-r border-slate-300">
            <span className="font-semibold">IGST</span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="text-slate-500">@</span>
              <span className="font-bold">{quotation.igst_rate || 18}%</span>
            </div>
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900 whitespace-nowrap min-w-0">
            {hasTax && isInterState ? igstParts.rs : '0'}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {hasTax && isInterState ? igstParts.ps : '00'}
          </div>
        </div>
        {/* Row 5: Total */}
        <div
          className="flex items-stretch h-[28px]"
          style={{ backgroundColor: '#CCE4F7', borderTop: '1.4px solid #082138' }}
        >
          <div className="w-[136px] shrink-0 px-2 flex items-center font-black text-[#082138] text-[10.5px] leading-tight border-r border-[#082138]">
            Quotation Total Amount
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-black text-[12px] text-[#082138] whitespace-nowrap min-w-0">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <span>₹</span>
              <span>{totalParts.rs}</span>
            </span>
          </div>
          <div className="w-[42px] shrink-0 border-l border-[#082138] flex items-center justify-center font-mono text-[9px] font-bold text-[#082138]">
            {totalParts.ps}
          </div>
        </div>
      </div>
    </div>
  );

  // Terms & Conditions Box
  const renderTermsDisclaimer = () => (
    <div
      className="rounded-lg p-2.5 mb-2"
      style={{ border: '1.4px solid #9CCBF0', backgroundColor: '#F4F9FD' }}
    >
      <div className="text-[8.5px] text-slate-800 leading-[1.3] font-medium">
        <p className="font-bold text-[#082138] text-[9.5px] mb-0.5">Commercial Terms &amp; Conditions:</p>
        {quotation.terms_and_conditions && quotation.terms_and_conditions.length > 0 ? (
          <ul className="list-disc list-inside space-y-0.5">
            {quotation.terms_and_conditions.map((term, tIdx) => (
              <li key={tIdx} className="leading-tight">{term}</li>
            ))}
          </ul>
        ) : (
          <p>
            1. Payment 50% Advance with purchase order, balance before machine dispatch. 2. Packing, loading and freight charges extra at actuals. 3. Quotation valid for 15 days from issue date. 4. Machinery delivered subject to Coimbatore Jurisdiction.
          </p>
        )}
      </div>
    </div>
  );

  // Bank Details, GSTIN & Signatory
  const renderBankAndSignatory = () => (
    <div className="grid grid-cols-12 gap-3 items-end pt-0.5">
      <div className="col-span-5 space-y-1.5">
        <div className="inline-flex items-center bg-[#082138] text-white px-3 py-0.5 rounded-full text-[9.5px] font-bold">
          <span>Bank Details</span>
        </div>
        <div className="text-[9px] space-y-0.5 text-slate-800 pl-1">
          <p className="font-black text-[#082138] text-[10px]">
            {quotation.bank_name || 'STATE BANK OF INDIA'}
          </p>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">A/c Name</span>
            <span className="col-span-8 font-bold text-slate-900">: {quotation.bank_account_name || 'Murthi Machin Works'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">A/c No.</span>
            <span className="col-span-8 font-mono font-bold text-slate-950">: {quotation.bank_account_no || '44117451637'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">IFSC</span>
            <span className="col-span-8 font-mono font-bold text-slate-950">: {quotation.bank_ifsc || 'SBIN0021453'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">Branch</span>
            <span className="col-span-8 font-bold text-slate-900">: {quotation.bank_branch || 'Avarampalayam'}</span>
          </div>
        </div>
      </div>

      <div className="col-span-3 pb-1 border-l border-slate-300 pl-3">
        <div className="flex items-center text-[9.5px] font-bold text-[#082138]">
          <span>Party's GSTIN No</span>
        </div>
        <div className="border-b border-slate-500 mt-2 min-h-[18px] text-[10.5px] font-mono font-bold text-slate-900 pl-1">
          {quotation.customer_gstin || quotation.customer_phone || ''}
        </div>
      </div>

      <div className="col-span-4 text-center space-y-10 pb-1 border-l border-slate-300 pl-4">
        <p className="font-bold text-[#082138] text-[11.5px] tracking-wide">
          For MURTHI MACHIN WORKS
        </p>
        <div className="border-t border-slate-400 pt-1">
          <span className="font-bold text-[10px] text-slate-900 uppercase tracking-wider">
            Authorised Signatory
          </span>
        </div>
      </div>
    </div>
  );

  // Common sheet styling (A4 standard: 794px x 1123px)
  const sheetStyle: React.CSSProperties = {
    width: '794px',
    height: '1123px',
    minHeight: '1123px',
    maxHeight: '1123px',
    padding: '20px 26px 20px 26px',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  };

  // Case 1: Single Page Quotation (5 items or fewer)
  if (items.length <= 5) {
    return (
      <div
        id={id}
        className="a4-page-sheet bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
        style={sheetStyle}
      >
        {renderSvgDecorations()}
        <div className="relative z-10 h-full flex flex-col justify-start">
          {renderFullBrandHeader()}
          {renderQuotationBanner()}
          {renderNoAndDateRow()}
          {renderCustomerBox()}
          {renderTermsGrid()}
          {renderTable(items, 0, 290, false, false)}
          {renderTotalsAndTax()}
          {renderTermsDisclaimer()}
          {renderBankAndSignatory()}
        </div>
      </div>
    );
  }

  // Case 2: Multi-Page Quotation (> 5 items)
  // Split into Page 1 (first 5 items) and Page 2 (remaining items)
  const page1Items = items.slice(0, 5);
  const page2Items = items.slice(5);

  return (
    <div id={id} className="space-y-6 print:space-y-0">
      {/* ===================== PAGE 1 ===================== */}
      <div
        className="a4-page-sheet bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
        style={sheetStyle}
      >
        {renderSvgDecorations()}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            {renderFullBrandHeader()}
            {renderQuotationBanner()}
            {renderNoAndDateRow()}
            {renderCustomerBox()}
            {renderTermsGrid()}
            {renderTable(page1Items, 0, 360, false, true)}
          </div>
          {/* Page 1 Bottom Footer */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>Quotation: <strong className="font-mono text-slate-900">{quotation.quotation_number}</strong></span>
            <span className="font-bold text-[#082138] bg-slate-100 px-3 py-1 rounded-full">
              Page 1 of 2 (Continued on Next Sheet)
            </span>
            <span>Murthi Machin Works</span>
          </div>
        </div>
      </div>

      {/* ===================== PAGE 2 ===================== */}
      <div
        className="a4-page-sheet bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
        style={sheetStyle}
      >
        {renderSvgDecorations()}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            {renderContinuationHeader(2, 2)}
            {renderTable(page2Items, 5, 230, true, false)}
            {renderTotalsAndTax()}
            {renderTermsDisclaimer()}
            {renderBankAndSignatory()}
          </div>
          {/* Page 2 Bottom Footer */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>Quotation: <strong className="font-mono text-slate-900">{quotation.quotation_number}</strong></span>
            <span className="font-bold text-[#082138] bg-slate-100 px-3 py-1 rounded-full">
              Page 2 of 2 (Final Sheet)
            </span>
            <span>Murthi Machin Works</span>
          </div>
        </div>
      </div>
    </div>
  );
};
