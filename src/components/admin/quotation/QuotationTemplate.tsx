import React from 'react';
import { Quotation } from '../../../types';
import { formatDateIndian } from '../../../utils/helpers';

interface QuotationTemplateProps {
  quotation: Quotation;
  id?: string;
}

export const QuotationTemplate: React.FC<QuotationTemplateProps> = ({
  quotation,
  id = 'a4-quotation-render'
}) => {
  const items = quotation.items || [];
  const addressLines = (quotation.customer_address || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const formattedDate = formatDateIndian(quotation.quotation_date) || '21/07/2026';

  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  const isIntraState = quotation.tax_type === 'intra_state' || !quotation.tax_type;
  const isInterState = quotation.tax_type === 'inter_state';
  const hasTax = quotation.tax_type !== 'none';

  return (
    <div
      id={id}
      className="bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
      style={{
        width: '794px',
        height: '1123px',
        minHeight: '1123px',
        maxHeight: '1123px',
        padding: '26px 36px 24px 36px',
        fontFamily: '"Times New Roman", Times, Georgia, serif',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box'
      }}
    >
      {/* =========================================================================
          WATERMARK: LORD VISHWAKARMA / SACRED ARCHITECT & CRAFTSMAN OF MACHINERY
         ========================================================================= */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        style={{ top: '60px', bottom: '70px' }}
      >
        <svg
          viewBox="0 0 500 650"
          className="w-[430px] h-[560px] opacity-[0.14]"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Divine Prabhamandala (Outer halo & decorative arch) */}
          <path
            d="M 120 480 C 100 350, 100 180, 250 100 C 400 180, 400 350, 380 480"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <path d="M 140 480 C 120 360, 120 200, 250 130 C 380 200, 380 360, 360 480" />
          <circle cx="250" cy="185" r="50" strokeWidth="1.2" strokeDasharray="2 3" />
          <circle cx="250" cy="185" r="44" strokeWidth="1" />

          {/* Crown (Kireeta Makuta) */}
          <polygon points="250,135 235,160 265,160" fill="#2563EB" fillOpacity="0.08" />
          <path d="M 230 160 Q 250 152 270 160 L 265 175 Q 250 170 235 175 Z" />
          <circle cx="250" cy="132" r="4" fill="#2563EB" />

          {/* Face & Tilak */}
          <path d="M 238 175 C 235 200, 265 200, 262 175" />
          <path d="M 242 186 Q 250 190 258 186" />
          <path d="M 249 175 L 249 183" strokeWidth="2" stroke="#DC2626" />
          <circle cx="249" cy="178" r="1.5" fill="#DC2626" />

          {/* Divine Neck & Garlands */}
          <path d="M 243 198 Q 250 203 257 198" />
          <path d="M 230 205 Q 250 225 270 205" strokeWidth="1.8" />
          <path d="M 225 215 Q 250 240 275 215" strokeWidth="1.2" />

          {/* Upper Body & Sacred Thread (Yajnopavita) */}
          <path d="M 220 205 C 200 240, 210 300, 230 320 L 270 320 C 290 300, 300 240, 280 205" />
          <path d="M 232 208 Q 255 250 265 318" strokeDasharray="3 3" />

          {/* 4 Divine Arms & Tools */}
          {/* Upper Right Arm holding Divine Measuring Scale / Water Pot */}
          <path d="M 220 215 C 180 215, 170 240, 165 270" strokeWidth="2" />
          <path d="M 165 270 L 155 255" />
          {/* Sacred Book / Tool */}
          <rect x="145" y="242" width="22" height="15" rx="2" strokeWidth="1.4" />
          <line x1="145" y1="249" x2="167" y2="249" />

          {/* Upper Left Arm holding Divine Hammer / Tool */}
          <path d="M 280 215 C 320 215, 330 240, 335 270" strokeWidth="2" />
          <path d="M 335 270 L 345 255" />
          {/* Hammer Head & Handle */}
          <line x1="335" y1="260" x2="355" y2="240" strokeWidth="2" />
          <rect
            x="348"
            y="235"
            width="14"
            height="8"
            transform="rotate(45 355 239)"
            strokeWidth="1.5"
            fill="#2563EB"
            fillOpacity="0.1"
          />

          {/* Lower Right Arm in Abhaya Mudra / Sacred Chisel */}
          <path d="M 225 240 C 200 265, 205 300, 215 320" strokeWidth="1.8" />
          <circle cx="215" cy="322" r="5" strokeWidth="1.2" />
          {/* Measuring Compass / Plumb Line */}
          <path d="M 205 325 L 215 345 L 225 325" strokeWidth="1.5" />

          {/* Lower Left Arm holding Engineering Tool / Anvil */}
          <path d="M 275 240 C 300 265, 295 300, 285 320" strokeWidth="1.8" />
          <circle cx="285" cy="322" r="5" strokeWidth="1.2" />

          {/* Seated Position (Padmasana / Lotus Throne) */}
          <path d="M 200 320 C 180 340, 160 380, 190 400 C 220 405, 250 395, 250 395 C 250 395, 280 405, 310 400 C 340 380, 320 340, 300 320 Z" />
          <path d="M 185 390 C 220 420, 280 420, 315 390" strokeWidth="2" />

          {/* Lotus Petal Base (Padma Peedam) */}
          <path d="M 150 420 C 190 405, 310 405, 350 420 L 365 445 C 320 455, 180 455, 135 445 Z" fill="#1E40AF" fillOpacity="0.04" />
          <path d="M 160 425 Q 180 440 200 425" />
          <path d="M 200 425 Q 225 442 250 425" />
          <path d="M 250 425 Q 275 442 300 425" />
          <path d="M 300 425 Q 320 440 340 425" />

          {/* Industrial Gear & Wheels below Deity Throne */}
          <circle cx="250" cy="485" r="32" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="250" cy="485" r="16" strokeWidth="1.2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 250 + Math.cos(rad) * 16;
            const y1 = 485 + Math.sin(rad) * 16;
            const x2 = 250 + Math.cos(rad) * 32;
            const y2 = 485 + Math.sin(rad) * 32;
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.2" />;
          })}

          {/* Decorative side pillars / prabhavali base */}
          <line x1="120" y1="445" x2="120" y2="520" strokeWidth="1.5" />
          <line x1="380" y1="445" x2="380" y2="520" strokeWidth="1.5" />
          <line x1="100" y1="520" x2="400" y2="520" strokeWidth="2" />
        </svg>
      </div>

      {/* Main Content Layout Container */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          {/* =======================================================================
              HEADER: MURTHI MACHINE WORKS (RED BOLD SERIF AS PER REFERENCE)
             ======================================================================= */}
          <div className="text-center pt-1">
            <h1
              className="text-[34px] font-black tracking-tight text-[#D32F2F] uppercase leading-none"
              style={{
                fontFamily: '"Times New Roman", Times, Georgia, serif',
                letterSpacing: '0.04em'
              }}
            >
              MURTHI MACHINE WORKS
            </h1>

            {/* Subtitle boxed by horizontal blue rules */}
            <div className="mt-2 py-0.5 border-y-[1.6px] border-[#0B3B60]">
              <p
                className="text-[10px] font-bold text-[#082138] uppercase tracking-normal leading-tight"
                style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
              >
                Machinery Merchants for Industrial use, New, Old &amp; Recondition Works, Textile Works &amp; Fabrication Works
              </p>
            </div>

            {/* Cell & GSTIN in bold navy text */}
            <div className="mt-1">
              <p
                className="text-[13px] font-bold text-[#0B3B60] tracking-wide"
                style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
              >
                Cell : 98422 66521, 87783 84248 | GSTIN NO : 33ALVPM1230G1Z8
              </p>
            </div>

            {/* Prominent dark blue dividing rule */}
            <div className="border-b-[2px] border-[#0B3B60] mt-2 mb-2" />
          </div>

          {/* =======================================================================
              DATE & QUOTATION NUMBER ROW
             ======================================================================= */}
          <div className="flex items-center justify-between px-1 text-[13px] font-bold text-slate-900 mt-1 mb-1.5">
            {/* Optional Quotation # for internal audit */}
            <div className="text-[11.5px] font-mono text-slate-600 font-semibold">
              Ref : <span className="text-slate-900 font-bold">{quotation.quotation_number || 'MMW/QTN/2026-27/001'}</span>
            </div>

            {/* Date with dotted leader matching physical format */}
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-slate-950">Date :</span>
              <span className="border-b border-dotted border-slate-700 min-w-[130px] inline-block text-center font-bold text-slate-950 px-2">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* =======================================================================
              DOCUMENT TITLE: QUOTATION
             ======================================================================= */}
          <div className="text-center my-1.5">
            <h2
              className="text-[17px] font-black uppercase tracking-wider text-slate-950 inline-block border-b-[1.8px] border-slate-950 pb-0.5"
              style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
            >
              QUOTATION
            </h2>
          </div>

          {/* =======================================================================
              RECIPIENT DETAILS: "To,"
             ======================================================================= */}
          <div className="text-[12px] text-slate-950 leading-[1.35] mb-3 pl-1">
            <p className="font-bold">To,</p>
            <div className="pl-4 font-bold text-[12.5px] text-slate-950 uppercase tracking-tight mt-0.5">
              <p className="text-[13px] font-extrabold">{quotation.customer_name || 'S. S ENGINEERING'}</p>
              {addressLines.length > 0 ? (
                addressLines.map((line, i) => (
                  <p key={i} className="font-semibold text-slate-800 normal-case">
                    {line}
                  </p>
                ))
              ) : (
                <>
                  <p className="font-semibold text-slate-800 normal-case">SF NO 12/13, New Street, Suriya Nagar,</p>
                  <p className="font-semibold text-slate-800 normal-case">Kamatchipuram, Ondipudur,</p>
                  <p className="font-semibold text-slate-800 normal-case">Coimbatore - 641016</p>
                </>
              )}
              {quotation.customer_gstin && (
                <p className="mt-0.5 text-[12px] font-bold text-slate-950">
                  GST: <span className="font-mono">{quotation.customer_gstin}</span>
                </p>
              )}
            </div>
          </div>

          {/* =======================================================================
              QUOTATION ITEMS TABLE
              S.NO | PRODUCT DESCRIPTION | QUANTITY | RATE PER QUANTITY | TOTAL
             ======================================================================= */}
          <div
            className="overflow-hidden bg-white/95"
            style={{
              border: '1.6px solid #1E293B',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            {/* Table Header */}
            <div
              className="bg-slate-50 text-slate-950 font-black text-[11px] flex items-stretch border-b-[1.6px] border-[#1E293B]"
              style={{ minHeight: '30px' }}
            >
              <div className="w-[55px] border-r border-[#1E293B] flex items-center justify-center font-bold">
                S.NO
              </div>
              <div className="flex-1 px-3 border-r border-[#1E293B] flex items-center font-bold">
                PRODUCT DESCRIPTION
              </div>
              <div className="w-[90px] border-r border-[#1E293B] flex items-center justify-center font-bold text-center">
                QUANTITY
              </div>
              <div className="w-[145px] border-r border-[#1E293B] flex items-center justify-center font-bold text-center">
                RATE PER QUANTITY
              </div>
              <div className="w-[145px] flex items-center justify-center font-bold text-center">
                TOTAL
              </div>
            </div>

            {/* Table Body */}
            <div
              className="flex items-stretch relative"
              style={{
                minHeight: '220px'
              }}
            >
              {/* Column 1: S.NO */}
              <div className="w-[55px] border-r border-[#1E293B] text-center py-2 text-[11.5px] font-bold text-slate-900">
                {items.map((_, idx) => (
                  <div key={idx} className="min-h-[28px] flex items-center justify-center mb-1">
                    {idx + 1})
                  </div>
                ))}
              </div>

              {/* Column 2: PRODUCT DESCRIPTION */}
              <div className="flex-1 border-r border-[#1E293B] px-3 py-2 text-left text-[11.5px] font-bold text-slate-950">
                {items.map((item, idx) => (
                  <div key={idx} className="min-h-[28px] flex items-center uppercase mb-1 leading-snug">
                    {item.product_description}
                  </div>
                ))}
              </div>

              {/* Column 3: QUANTITY */}
              <div className="w-[90px] border-r border-[#1E293B] text-center py-2 text-[11.5px] font-bold text-slate-900 font-mono">
                {items.map((item, idx) => (
                  <div key={idx} className="min-h-[28px] flex items-center justify-center mb-1">
                    {item.quantity}
                  </div>
                ))}
              </div>

              {/* Column 4: RATE PER QUANTITY */}
              <div className="w-[145px] border-r border-[#1E293B] text-right pr-3 py-2 text-[11.5px] font-bold text-slate-900 font-mono">
                {items.map((item, idx) => (
                  <div key={idx} className="min-h-[28px] flex items-center justify-end mb-1">
                    {formatCurrency(item.rate)}
                  </div>
                ))}
              </div>

              {/* Column 5: TOTAL */}
              <div className="w-[145px] text-right pr-3 py-2 text-[11.5px] font-bold text-slate-950 font-mono">
                {items.map((item, idx) => (
                  <div key={idx} className="min-h-[28px] flex items-center justify-end mb-1">
                    {formatCurrency(item.amount)}
                  </div>
                ))}
              </div>
            </div>

            {/* ===================================================================
                TOTALS & TAX BREAKDOWN (EXACT MATCH TO REFERENCE IMAGE)
               =================================================================== */}
            <div className="border-t-[1.6px] border-[#1E293B] bg-white">
              {/* Row 1: TOTAL */}
              <div className="flex items-stretch border-b border-[#1E293B] h-[26px] text-[11.5px]">
                <div className="flex-1" />
                <div className="w-[200px] border-l border-r border-[#1E293B] px-3 flex items-center font-bold text-slate-950 uppercase">
                  TOTAL
                </div>
                <div className="w-[145px] pr-3 flex items-center justify-end font-bold font-mono text-slate-950 text-[12px]">
                  {formatCurrency(quotation.subtotal)}
                </div>
              </div>

              {/* Row 2: CGST */}
              {hasTax && isIntraState && (
                <div className="flex items-stretch border-b border-[#1E293B] h-[26px] text-[11.5px]">
                  <div className="flex-1" />
                  <div className="w-[200px] border-l border-r border-[#1E293B] px-3 flex items-center font-bold text-slate-900">
                    CGST (@ {quotation.cgst_rate || 9}%)
                  </div>
                  <div className="w-[145px] pr-3 flex items-center justify-end font-bold font-mono text-slate-950 text-[12px]">
                    {formatCurrency(quotation.cgst_amount)}
                  </div>
                </div>
              )}

              {/* Row 3: SGST */}
              {hasTax && isIntraState && (
                <div className="flex items-stretch border-b border-[#1E293B] h-[26px] text-[11.5px]">
                  <div className="flex-1" />
                  <div className="w-[200px] border-l border-r border-[#1E293B] px-3 flex items-center font-bold text-slate-900">
                    SGST (@ {quotation.sgst_rate || 9}%)
                  </div>
                  <div className="w-[145px] pr-3 flex items-center justify-end font-bold font-mono text-slate-950 text-[12px]">
                    {formatCurrency(quotation.sgst_amount)}
                  </div>
                </div>
              )}

              {/* Row 4: IGST */}
              {hasTax && (
                <div className="flex items-stretch border-b border-[#1E293B] h-[26px] text-[11.5px]">
                  <div className="flex-1" />
                  <div className="w-[200px] border-l border-r border-[#1E293B] px-3 flex items-center font-bold text-slate-900">
                    IGST (@ {quotation.igst_rate || 18}%)
                  </div>
                  <div className="w-[145px] pr-3 flex items-center justify-end font-bold font-mono text-slate-950 text-[12px]">
                    {isInterState && quotation.igst_amount ? formatCurrency(quotation.igst_amount) : '-'}
                  </div>
                </div>
              )}

              {/* Row 5: GRAND TOTAL */}
              <div className="flex items-stretch h-[29px] text-[12px] bg-slate-50">
                <div className="flex-1" />
                <div className="w-[200px] border-l border-r border-[#1E293B] px-3 flex items-center font-black text-slate-950 uppercase">
                  GRAND TOTAL
                </div>
                <div className="w-[145px] pr-3 flex items-center justify-end font-black font-mono text-slate-950 text-[13px]">
                  {formatCurrency(quotation.total_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================================
              TERMS AND CONDITIONS & ACCOUNT DETAILS
             ======================================================================= */}
          <div className="mt-4 space-y-3.5 text-[11px] text-slate-950">
            {/* TERMS AND CONDITIONS */}
            <div>
              <p className="font-bold underline uppercase tracking-tight text-[11.5px] mb-1">
                TERMS AND CONDITIONS:
              </p>
              <div className="space-y-0.5 text-slate-900 font-semibold pl-0.5 leading-snug">
                {quotation.terms_and_conditions && quotation.terms_and_conditions.length > 0 ? (
                  quotation.terms_and_conditions.map((term, i) => (
                    <p key={i}>
                      {i + 1}) {term.replace(/^\d+\)\s*/, '')}
                    </p>
                  ))
                ) : (
                  <>
                    <p>1) Payment 50% Advance and balance before delivery.</p>
                    <p>2) Machine Packing, Loading and Freight charges will be extra.</p>
                  </>
                )}
              </div>
            </div>

            {/* ACCOUNT DETAILS & SIGNATORY ROW */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <p className="font-bold underline uppercase tracking-tight text-[11.5px] mb-1">
                  ACCOUNT DETAILS:
                </p>
                <div className="text-[11px] space-y-0.5 text-slate-900 pl-0.5 leading-snug">
                  <p>
                    <strong className="font-bold text-slate-950">Account Name:</strong>{' '}
                    {quotation.bank_account_name || 'Murthi Machin Works'}
                  </p>
                  <p>
                    <strong className="font-bold text-slate-950">Account Number:</strong>{' '}
                    <span className="font-mono font-bold">{quotation.bank_account_no || '44117451637'}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-slate-950">IFSC Code:</strong>{' '}
                    <span className="font-mono font-bold">{quotation.bank_ifsc || 'SBIN0021453'}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-slate-950">Branch:</strong>{' '}
                    {quotation.bank_branch || 'Avarampalayam'}
                  </p>
                </div>
              </div>

              {/* Signatory Box */}
              <div className="text-center pr-2 pt-2 space-y-9">
                <p className="font-bold text-slate-950 text-[11.5px] tracking-wide">
                  For MURTHI MACHINE WORKS
                </p>
                <div className="border-t border-slate-700 pt-1 min-w-[170px]">
                  <span className="font-bold text-[10px] text-slate-900 uppercase tracking-wider">
                    Authorised Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================================
            FOOTER: 3 FACTORY BRANCH ADDRESSES & EMAIL (MATCHING REFERENCE IMAGE)
           ======================================================================= */}
        <div className="pt-2">
          {/* Framed between two blue horizontal lines */}
          <div className="border-t-[1.8px] border-b-[1.8px] border-[#0B3B60] py-1 text-center text-[#0B3B60]">
            <div
              className="text-[9.5px] font-bold leading-[1.3] space-y-0.5"
              style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
            >
              <p>21A, Rajaji Nagar, Iyer Hospital Bus Stop, Singanallur, Coimbatore - 641 005.</p>
              <p>No.45, South Street No.1, Avarampalayam, Coimbatore - 641 006.</p>
              <p>SF.No.215/4C1, Irugur Main Road, Ondipudur, Meena Furniture Opp, Coimbatore - 641 016.</p>
              <p className="pt-0.5">
                <span className="font-extrabold">Email :</span> murthimachineworks@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
