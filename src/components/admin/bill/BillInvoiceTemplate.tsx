import React from 'react';
import { Bill, BillItem } from '../../../types';
import { splitRupeesPaise, formatDateIndian } from '../../../utils/helpers';
import {
  Phone,
  MapPin,
  Mail,
  FileText,
  Calendar,
  Truck,
  Users
} from 'lucide-react';

interface BillInvoiceTemplateProps {
  bill: Bill;
  id?: string;
}

export const BillInvoiceTemplate: React.FC<BillInvoiceTemplateProps> = ({ bill, id = 'a4-invoice-render' }) => {
  const subtotalParts = splitRupeesPaise(bill.subtotal || 0);
  const cgstParts = splitRupeesPaise(bill.cgst_amount || 0);
  const sgstParts = splitRupeesPaise(bill.sgst_amount || 0);
  const igstParts = splitRupeesPaise(bill.igst_amount || 0);
  const totalParts = splitRupeesPaise(bill.total_amount || 0);

  // Address lines
  const addressLines = (bill.customer_address || '').split('\n').filter(l => l.trim().length > 0);
  const addrLine1 = addressLines[0] || '';
  const addrLine2 = addressLines.slice(1).join(', ') || '';

  const items = bill.items || [];
  const formattedDate = formatDateIndian(bill.invoice_date || new Date().toISOString().slice(0, 10));

  const isIntraState = bill.tax_type === 'intra_state';
  const isInterState = bill.tax_type === 'inter_state';

  // Corner SVGs
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

  // Invoice Banner Ribbon & GSTIN
  const renderInvoiceBanner = () => (
    <div className="relative flex items-center justify-between h-[46px] overflow-hidden rounded-xs mb-2">
      <div className="relative flex items-center h-full w-[380px]">
        <svg width="380" height="46" viewBox="0 0 380 46" className="absolute left-0 top-0">
          <polygon points="0,0 380,0 330,46 0,46" fill="#082138" />
        </svg>
        <div className="relative z-10 pl-6 pr-12 text-white">
          <h3 className="font-black text-[25px] tracking-wider leading-none text-white font-sans">
            INVOICE
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
          {bill.invoice_number || 'MMW/2026-27/001'}
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

  // Customer Box
  const renderCustomerBox = () => (
    <div
      className="rounded-lg p-2.5 space-y-2 mb-2"
      style={{ border: '1.4px solid #9CCBF0', backgroundColor: '#F4F9FD' }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-[#082138] text-[12px] shrink-0">Messers.</span>
        <div className="border-b border-slate-400 flex-1 pb-0.5 font-bold text-[12px] text-slate-950 pl-2 min-h-[18px]">
          {bill.customer_name || ''}
        </div>
      </div>
      <div className="border-b border-slate-400 min-h-[18px] text-[10.5px] text-slate-800 font-medium pl-16 pb-0.5">
        {addrLine1}
      </div>
      <div className="flex items-baseline gap-4">
        <div className="border-b border-slate-400 flex-1 min-h-[18px] text-[10.5px] text-slate-800 font-medium pl-16 pb-0.5">
          {addrLine2}
        </div>
        <div className="flex items-baseline gap-1.5 w-[240px] shrink-0">
          <span className="font-bold text-[#082138] text-[11.5px] shrink-0">GSTIN :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[18px] font-bold font-mono text-[11.5px] text-slate-950 pl-1.5 pb-0.5">
            {bill.customer_gstin || ''}
          </div>
        </div>
      </div>
    </div>
  );

  // Transport & Logistics Box
  const renderTransportBox = () => (
    <div
      className="rounded-lg p-2.5 text-[9.5px] mb-2"
      style={{ border: '1.4px solid #9CCBF0', backgroundColor: '#F4F9FD' }}
    >
      <div className="grid grid-cols-12 gap-x-3.5 gap-y-2 items-center">
        <div className="col-span-5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#082138] shrink-0" />
          <span className="font-bold text-[#082138] shrink-0">Your Order No :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 font-mono text-[10px]">
            {bill.order_number || ''}
          </div>
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#082138] shrink-0" />
          <span className="font-bold text-[#082138] shrink-0">Dated :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 font-mono text-[10px]">
            {formatDateIndian(bill.order_date)}
          </div>
        </div>
        <div className="col-span-4 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#082138] shrink-0" />
          <span className="font-bold text-[#082138] shrink-0">Our Delivery Note No :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 font-mono text-[10px]">
            {bill.delivery_note_no || ''}
          </div>
        </div>
        <div className="col-span-5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#082138] shrink-0" />
          <span className="font-bold text-[#082138] shrink-0">Despatched by :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-medium text-slate-900 text-[9.5px]">
            {bill.despatched_by || ''}
          </div>
        </div>
        <div className="col-span-4 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#082138] shrink-0" />
          <span className="font-bold text-[#082138] shrink-0">Document Through :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-medium text-slate-900 text-[9.5px]">
            {bill.document_through || ''}
          </div>
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#082138] shrink-0" />
          <span className="font-bold text-[#082138] shrink-0">Dated :</span>
          <div className="border-b border-slate-400 flex-1 min-h-[15px] pl-1 font-bold text-slate-900 font-mono text-[10px]">
            {formatDateIndian(bill.delivery_note_date)}
          </div>
        </div>
      </div>
    </div>
  );

  // Machinery Table
  const renderTable = (
    itemsList: BillItem[],
    startIdx: number,
    minHeightPx: number = 200,
    showContinuationNotice: boolean = false,
    nextPageNum?: number
  ) => {
    return (
      <div className="overflow-hidden bg-white mb-2 flex-1 flex flex-col min-h-0" style={{ border: '1.6px solid #082138' }}>
        {/* Table Header: enlarged for crisp legibility */}
        <div className="bg-[#082138] text-white font-bold h-[38px] flex items-stretch text-[11.5px] shrink-0">
          <div className="w-[52px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold tracking-wide">
            Sl.No
          </div>
          <div className="w-[298px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold tracking-wide">
            Particulars
          </div>
          <div className="w-[80px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold tracking-wide">
            HSN Code
          </div>
          <div className="w-[114px] shrink-0 border-r border-white/40 flex flex-col justify-center text-center">
            <div className="border-b border-white/40 pb-0.5 font-bold tracking-wide">Rate</div>
            <div className="flex items-stretch text-[10px] pt-0.5 h-[17px]">
              <span className="w-[74px] shrink-0 border-r border-white/40 font-semibold flex items-center justify-center">Rs.</span>
              <span className="w-[40px] shrink-0 font-semibold flex items-center justify-center">Ps.</span>
            </div>
          </div>
          <div className="w-[54px] shrink-0 border-r border-white/40 flex items-center justify-center font-bold tracking-wide">
            Qty
          </div>
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="border-b border-white/40 pb-0.5 font-bold tracking-wide">Amount</div>
            <div className="flex items-stretch text-[10px] pt-0.5 h-[17px]">
              <span className="flex-1 border-r border-white/40 font-semibold flex items-center justify-center">Rs.</span>
              <span className="w-[42px] shrink-0 font-semibold flex items-center justify-center">Ps.</span>
            </div>
          </div>
        </div>

        {/* Table Body: exact uniform font size, height and padding across ALL pages */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
          {itemsList.map((item, idx) => {
            const rateParts = splitRupeesPaise(item.rate || 0);
            const amountParts = splitRupeesPaise(item.amount || 0);

            return (
              <div
                key={item.id || idx}
                className="flex items-stretch border-b border-slate-200 min-h-[46px] shrink-0"
              >
                <div className="w-[52px] shrink-0 border-r border-slate-300 flex items-center justify-center font-bold text-slate-900 text-[13px] py-2.5 bg-white">
                  {startIdx + idx + 1}
                </div>
                <div className="w-[298px] shrink-0 border-r border-slate-300 px-3 py-2 flex flex-col justify-center text-left min-w-0 bg-white">
                  <span className="font-extrabold text-slate-950 text-[13px] leading-snug">
                    {item.product_name}
                  </span>
                  {item.serial_number && (
                    <span className="text-[11px] text-slate-600 font-mono font-medium mt-0.5">
                      S/N: {item.serial_number}
                    </span>
                  )}
                </div>
                <div className="w-[80px] shrink-0 border-r border-slate-300 flex items-center justify-center font-mono text-[12px] text-slate-800 font-semibold py-2.5 bg-white">
                  {item.hsn_code || '84581100'}
                </div>
                <div className="w-[114px] shrink-0 border-r border-slate-300 flex items-stretch bg-white">
                  <div className="w-[74px] shrink-0 border-r border-slate-300 pr-2.5 py-2.5 flex items-center justify-end font-mono font-bold text-slate-900 text-[13px] whitespace-nowrap">
                    {rateParts.rs}
                  </div>
                  <div className="w-[40px] shrink-0 py-2.5 flex items-center justify-center font-mono text-[11px] text-slate-600">
                    {rateParts.ps}
                  </div>
                </div>
                <div className="w-[54px] shrink-0 border-r border-slate-300 flex items-center justify-center font-mono font-bold text-slate-950 text-[13px] py-2.5 bg-white">
                  {item.quantity}
                </div>
                <div className="flex-1 flex items-stretch bg-white">
                  <div className="flex-1 pr-2.5 py-2.5 flex items-center justify-end font-mono font-black text-slate-950 text-[13px] whitespace-nowrap">
                    {amountParts.rs}
                  </div>
                  <div className="w-[42px] shrink-0 border-l border-slate-300 py-2.5 flex items-center justify-center font-mono text-[11px] text-slate-600">
                    {amountParts.ps}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continuous Vertical Lines Filler (absorbs empty space on last page cleanly) */}
          <div className="flex-1 flex items-stretch min-h-[30px]">
            <div className="w-[52px] shrink-0 border-r border-slate-300" />
            <div className="w-[298px] shrink-0 border-r border-slate-300" />
            <div className="w-[80px] shrink-0 border-r border-slate-300" />
            <div className="w-[114px] shrink-0 border-r border-slate-300 flex items-stretch">
              <div className="w-[74px] shrink-0 border-r border-slate-300" />
              <div className="w-[40px] shrink-0" />
            </div>
            <div className="w-[54px] shrink-0 border-r border-slate-300" />
            <div className="flex-1 flex items-stretch">
              <div className="flex-1" />
              <div className="w-[42px] shrink-0 border-l border-slate-300" />
            </div>
          </div>
        </div>

        {showContinuationNotice && (
          <div className="bg-[#082138] text-white px-4 py-2 flex items-center justify-between text-[11px] font-bold border-t border-slate-300 shrink-0">
            <span className="tracking-wide">Items Continued on Sheet {nextPageNum || 2} →</span>
            <span className="text-cyan-300 text-[10.5px] font-mono">This Sheet Items: {itemsList.length}</span>
          </div>
        )}
      </div>
    );
  };

  // Totals Box
  const renderTotalsAndTax = () => (
    <div className="flex items-stretch border-t border-slate-400 bg-white">
      <div
        className="p-2.5 flex flex-col justify-between border-r border-slate-400 bg-white shrink-0"
        style={{ width: '430px' }}
      >
        <div>
          <span className="font-bold text-[#082138] text-[11.5px]">Rupees in Words :</span>
          <div className="mt-1 font-semibold text-[10.5px] text-slate-900 leading-snug italic pr-2">
            {bill.rupees_in_words || '—'}
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          <div className="w-full border-b border-slate-300" />
          <div className="w-full border-b border-slate-300" />
        </div>
      </div>

      <div className="flex-1 text-[9.5px]">
        <div className="flex items-stretch border-b border-slate-300 h-[26px]">
          <div className="w-[136px] shrink-0 px-2 flex items-center font-bold text-slate-800 border-r border-slate-300 text-[9px] leading-tight">
            Total Amount Before Tax
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-bold text-slate-950 whitespace-nowrap min-w-0">
            {subtotalParts.rs}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {subtotalParts.ps}
          </div>
        </div>
        <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
          <div className="w-[136px] shrink-0 px-2 flex items-center justify-between border-r border-slate-300">
            <span className="font-semibold">CGST</span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="text-slate-500">@</span>
              <span className="font-bold">{bill.cgst_rate || 9}%</span>
            </div>
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900 whitespace-nowrap min-w-0">
            {isIntraState ? cgstParts.rs : '0'}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {isIntraState ? cgstParts.ps : '00'}
          </div>
        </div>
        <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
          <div className="w-[136px] shrink-0 px-2 flex items-center justify-between border-r border-slate-300">
            <span className="font-semibold">SGST</span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="text-slate-500">@</span>
              <span className="font-bold">{bill.sgst_rate || 9}%</span>
            </div>
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900 whitespace-nowrap min-w-0">
            {isIntraState ? sgstParts.rs : '0'}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {isIntraState ? sgstParts.ps : '00'}
          </div>
        </div>
        <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
          <div className="w-[136px] shrink-0 px-2 flex items-center justify-between border-r border-slate-300">
            <span className="font-semibold">IGST</span>
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="text-slate-500">@</span>
              <span className="font-bold">{bill.igst_rate || 18}%</span>
            </div>
          </div>
          <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900 whitespace-nowrap min-w-0">
            {isInterState ? igstParts.rs : '0'}
          </div>
          <div className="w-[42px] shrink-0 border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
            {isInterState ? igstParts.ps : '00'}
          </div>
        </div>
        <div
          className="flex items-stretch h-[28px]"
          style={{ backgroundColor: '#CCE4F7', borderTop: '1.4px solid #082138' }}
        >
          <div className="w-[136px] shrink-0 px-2 flex items-center font-black text-[#082138] text-[10.5px] leading-tight border-r border-[#082138]">
            Invoice Total Amount
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

  // Bank & Signatory Box
  const renderBankAndSignatory = () => (
    <div className="grid grid-cols-12 gap-3 items-end pt-0.5">
      <div className="col-span-5 space-y-1.5">
        <div className="inline-flex items-center bg-[#082138] text-white px-3 py-0.5 rounded-full text-[9.5px] font-bold">
          <span>Bank Details</span>
        </div>
        <div className="text-[9px] space-y-0.5 text-slate-800 pl-1">
          <p className="font-black text-[#082138] text-[10px]">
            {bill.bank_name || 'STATE BANK OF INDIA'}
          </p>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">A/c Name</span>
            <span className="col-span-8 font-bold text-slate-900">: {bill.bank_account_name || 'Murthi Machin Works'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">A/c No.</span>
            <span className="col-span-8 font-mono font-bold text-slate-950">: {bill.bank_account_no || '44117451637'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">IFSC</span>
            <span className="col-span-8 font-mono font-bold text-slate-950">: {bill.bank_ifsc || 'SBIN0021453'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1 font-medium">
            <span className="col-span-4 text-slate-600">Branch</span>
            <span className="col-span-8 font-bold text-slate-900">: {bill.bank_branch || 'Avarampalayam'}</span>
          </div>
        </div>
      </div>

      <div className="col-span-3 pb-1 border-l border-slate-300 pl-3">
        <div className="flex items-center text-[9.5px] font-bold text-[#082138]">
          <span>Party's GSTIN No</span>
        </div>
        <div className="border-b border-slate-500 mt-2 min-h-[18px] text-[10.5px] font-mono font-bold text-slate-900 pl-1">
          {bill.customer_gstin || ''}
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

  // Strict Fixed A4 Pagination for Bills:
  // - Fixed A4 size: 210mm x 297mm (794px x 1123px)
  // - Maximum 10 items per page
  // - 1–10 items: 1 page
  // - 11–20 items: 2 pages
  // - 21–30 items: 3 pages
  // - 31–40 items: 4 pages
  // - Never squeeze more than 10 items into one page.
  const ITEMS_PER_PAGE = 10;

  const paginateBillItems = (itemList: BillItem[]): { pageItems: BillItem[]; startIdx: number }[] => {
    if (itemList.length === 0) {
      return [{ pageItems: [], startIdx: 0 }];
    }

    const pages: { pageItems: BillItem[]; startIdx: number }[] = [];
    for (let i = 0; i < itemList.length; i += ITEMS_PER_PAGE) {
      pages.push({
        pageItems: itemList.slice(i, i + ITEMS_PER_PAGE),
        startIdx: i
      });
    }

    return pages;
  };

  const paginatedPages = paginateBillItems(items);

  // Single Page Bill (1 to 10 items)
  if (paginatedPages.length === 1) {
    return (
      <div
        id={id}
        className="a4-page-sheet bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
        style={sheetStyle}
      >
        {renderSvgDecorations()}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            {renderFullBrandHeader()}
            {renderInvoiceBanner()}
            {renderNoAndDateRow()}
            {renderCustomerBox()}
            {renderTransportBox()}
          </div>
          {renderTable(items, 0, 200, false)}
          <div>
            {renderTotalsAndTax()}
            {renderBankAndSignatory()}
          </div>
        </div>
      </div>
    );
  }

  // Multi-Page Bill (> 11 items)
  return (
    <div id={id} className="space-y-6 print:space-y-0">
      {paginatedPages.map(({ pageItems, startIdx }, pageIdx) => {
        const pageNumber = pageIdx + 1;
        const isLastPage = pageNumber === paginatedPages.length;

        return (
          <div
            key={pageIdx}
            className="a4-page-sheet bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
            style={sheetStyle}
          >
            {renderSvgDecorations()}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                {renderFullBrandHeader()}
                {renderInvoiceBanner()}
                {renderNoAndDateRow()}
                {/* On Page 2 and subsequent pages, DO NOT repeat Customer Box ("name") or Transport Box ("order number etc") */}
                {pageIdx === 0 && (
                  <>
                    {renderCustomerBox()}
                    {renderTransportBox()}
                  </>
                )}
              </div>

              {/* Table with items for this page (expands to fill vertical space) */}
              {renderTable(pageItems, startIdx, 200, !isLastPage, pageNumber + 1)}

              {/* Bottom content: Totals & Signature pinned at the LAST page bottom */}
              {isLastPage ? (
                <div>
                  {renderTotalsAndTax()}
                  {renderBankAndSignatory()}
                  <div className="pt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                    <span>Invoice: <strong className="font-mono text-slate-800">{bill.invoice_number}</strong></span>
                    <span className="font-bold text-[#082138] bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Sheet {pageNumber} of {paginatedPages.length} (Final Sheet)
                    </span>
                    <span>Murthi Machin Works</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>Invoice: <strong className="font-mono text-slate-900">{bill.invoice_number}</strong></span>
                  <span className="font-bold text-[#082138] bg-slate-100 px-3 py-1 rounded-full">
                    Sheet {pageNumber} of {paginatedPages.length} (Continued on Sheet {pageNumber + 1})
                  </span>
                  <span>Murthi Machin Works</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
