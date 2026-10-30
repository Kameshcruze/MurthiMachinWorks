import React from 'react';
import { Quotation } from '../../../types';
import { splitRupeesPaise, formatDateIndian } from '../../../utils/helpers';
import {
  Phone,
  MapPin,
  Mail
} from 'lucide-react';

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
  const formattedDate = formatDateIndian(quotation.quotation_date) || quotation.quotation_date || new Date().toISOString().slice(0, 10);

  const isIntraState = quotation.tax_type === 'intra_state' || !quotation.tax_type;
  const isInterState = quotation.tax_type === 'inter_state';
  const hasTax = quotation.tax_type !== 'none';

  // Calculate empty filler height to maintain the authentic continuous invoice format
  const minBodyHeightPx = 280;
  const estimatedRowHeightPx = 32;
  const contentHeightPx = items.length * estimatedRowHeightPx;
  const fillerHeightPx = Math.max(0, minBodyHeightPx - contentHeightPx);

  return (
    <div
      id={id}
      className="bg-white text-slate-900 select-none box-border shadow-2xl mx-auto overflow-hidden relative"
      style={{
        width: '794px',
        height: '1123px',
        minHeight: '1123px',
        maxHeight: '1123px',
        padding: '20px 26px 20px 26px',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box'
      }}
    >
      {/* =========================================================================
          TOP RIGHT CORNER DIAGONAL BANDS (Matching Bill Design)
         ========================================================================= */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '80px', height: '52px', zIndex: 0 }}
        viewBox="0 0 80 52"
        fill="none"
      >
        {/* Outer navy corner triangle */}
        <polygon points="42,0 80,0 80,30" fill="#082138" />
        {/* Parallel cyan diagonal stripe */}
        <polygon points="12,0 35,0 80,38 80,48 70,48 5,0" fill="#008CD6" />
      </svg>

      {/* =========================================================================
          BOTTOM RIGHT CORNER DIAGONAL BANDS (Matching Bill Design)
         ========================================================================= */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{ width: '150px', height: '60px', zIndex: 0 }}
        viewBox="0 0 150 60"
        fill="none"
      >
        {/* Outer navy bottom-right corner triangle */}
        <polygon points="150,18 150,60 95,60" fill="#082138" />
        {/* Parallel cyan diagonal stripe */}
        <polygon points="150,0 150,11 75,60 48,60 132,0" fill="#008CD6" />
      </svg>

      {/* =========================================================================
          BOTTOM LEFT CORNER CYAN SWOOSH (Matching Bill Design)
         ========================================================================= */}
      <svg
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: '160px', height: '55px', zIndex: 0 }}
        viewBox="0 0 160 55"
        fill="none"
      >
        {/* Cyan upper curved wedge */}
        <path
          d="M 0 55 L 0 20 C 35 32, 85 45, 160 55 Z"
          fill="#008CD6"
        />
        {/* Navy lower curved base */}
        <path
          d="M 0 55 L 0 38 C 25 45, 60 50, 105 55 Z"
          fill="#082138"
        />
      </svg>

      {/* Main Content Layout Container */}
      <div className="relative z-10 h-full flex flex-col justify-start">
        {/* =======================================================================
            SECTION 1: BRAND HEADER & CONTACT DETAILS
           ======================================================================= */}
        <div className="flex items-start justify-between mb-2">
          {/* Left: Industrial Cogwheel Logo + Brand Name in Two Lines */}
          <div className="flex items-center gap-3.5">
            {/* Cogwheel Gear SVG Logo */}
            <div className="w-[72px] h-[72px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Outer Gear Teeth in Deep Navy */}
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
                {/* Vibrant Cyan Inner Ring */}
                <circle cx="50" cy="50" r="33" fill="#008CD6" />
                {/* Crisp White Separator Ring */}
                <circle cx="50" cy="50" r="28" fill="#ffffff" />
                {/* Deep Navy Center Hub */}
                <circle cx="50" cy="50" r="25" fill="#082138" />
                {/* Bold White Letter "M" */}
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

            {/* Brand Title: Exactly Two Lines */}
            <div className="flex flex-col justify-center">
              {/* Line 1: MURTHI in Deep Navy */}
              <h1
                className="font-black text-[34px] tracking-tight text-[#082138] leading-none"
                style={{ fontWeight: 900 }}
              >
                MURTHI
              </h1>
              {/* Line 2: MACHIN WORKS in Vibrant Cyan */}
              <h2
                className="font-black text-[27px] tracking-tight text-[#008CD6] leading-none mt-1"
                style={{ fontWeight: 900 }}
              >
                MACHIN WORKS
              </h2>
              {/* Subtitle */}
              <div className="text-[8.5px] font-semibold text-slate-800 leading-[1.25] mt-1.5">
                <p>Machinery Merchants for Industrial use, New, Old &amp;</p>
                <p>Recondition Works, Textile &amp; Fabrications Works</p>
              </div>
            </div>
          </div>

          {/* Right: Contact Details (Cell, 3 Addresses, Email) */}
          <div className="text-[8px] text-slate-800 space-y-1 max-w-[325px] pr-4 pt-0.5">
            {/* Cell Phone */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[#082138] text-white flex items-center justify-center shrink-0">
                <Phone className="w-2.5 h-2.5" />
              </div>
              <span className="font-extrabold text-[#082138] text-[9.5px]">
                Cell: 98422 66521, 87783 84248
              </span>
            </div>

            {/* 3 Coimbatore Addresses */}
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

            {/* Email */}
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

        {/* =======================================================================
            SECTION 2: QUOTATION BANNER & GSTIN
           ======================================================================= */}
        <div className="relative flex items-center justify-between h-[46px] overflow-hidden rounded-xs mb-2">
          {/* Left: Angled Navy Ribbon with QUOTATION and Motto */}
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

          {/* Right: Company GSTIN */}
          <div className="text-right pr-3">
            <span className="text-[13.5px] font-black text-[#082138] tracking-wider">
              GSTIN No: 33ALVPM1230G1Z8
            </span>
          </div>
        </div>

        {/* =======================================================================
            SECTION 3: NO. AND DATE ROW
           ======================================================================= */}
        <div className="flex items-center justify-between px-1 text-[11.5px] font-bold text-slate-900 mb-2">
          {/* No. : _________________ */}
          <div className="flex items-baseline gap-2 flex-1 max-w-[360px]">
            <span className="font-bold text-slate-950 shrink-0">No. :</span>
            <div className="border-b border-slate-700 flex-1 pb-0.5 font-bold font-mono text-[11.5px] text-slate-950 pl-2">
              {quotation.quotation_number || 'MMW/QTN/2026-27/001'}
            </div>
          </div>

          {/* Date : _________________ */}
          <div className="flex items-baseline gap-2 flex-1 max-w-[300px] justify-end">
            <span className="font-bold text-slate-950 shrink-0">Date :</span>
            <div className="border-b border-slate-700 min-w-[200px] pb-0.5 text-center font-bold font-mono text-[11.5px] text-slate-950">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* =======================================================================
            SECTION 4: MESSERS (CUSTOMER DETAILS) BOX (Exact 3 Ruled Lines)
           ======================================================================= */}
        <div
          className="rounded-lg p-2.5 space-y-2 mb-2"
          style={{
            border: '1.4px solid #9CCBF0',
            backgroundColor: '#F4F9FD'
          }}
        >
          {/* Line 1: Messers. _____________________________________________ */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[#082138] text-[12px] shrink-0">Messers.</span>
            <div className="border-b border-slate-400 flex-1 pb-0.5 font-bold text-[12px] text-slate-950 pl-2 min-h-[18px]">
              {quotation.customer_name || ''}
            </div>
          </div>

          {/* Line 2: _______________________________________________________ */}
          <div className="border-b border-slate-400 min-h-[18px] text-[10.5px] text-slate-800 font-medium pl-16 pb-0.5">
            {addrLine1}
          </div>

          {/* Line 3: _______________________________ GSTIN : ______________ */}
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

        {/* =======================================================================
            SECTION 5: QUOTATION REFERENCE & COMMERCIAL TERMS GRID
           ======================================================================= */}
        <div
          className="rounded-lg p-2.5 text-[9.5px] mb-2"
          style={{
            border: '1.4px solid #9CCBF0',
            backgroundColor: '#F4F9FD'
          }}
        >
          <div className="grid grid-cols-12 gap-x-3.5 gap-y-2 items-center">
            {/* Row 1: Your Enquiry Ref (5 cols), Dated (3 cols), Validity (4 cols) */}
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

            {/* Row 2: Payment Terms (5 cols), Delivery (4 cols), Price Basis (3 cols) */}
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

            {/* Row 3: Taxes (5 cols), Packing & Freight (7 cols) */}
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

        {/* =======================================================================
            SECTION 6: MAIN MACHINERY TABLE + TOTALS BREAKDOWN
            Notice: Each S.No is strictly and perfectly aligned with its product row!
           ======================================================================= */}
        <div
          className="overflow-hidden bg-white mb-2"
          style={{
            border: '1.6px solid #082138'
          }}
        >
          {/* Table Header: Solid Navy with White Text */}
          <div className="bg-[#082138] text-white font-bold h-[34px] flex items-stretch text-[10px]">
            <div className="w-[50px] border-r border-white/40 flex items-center justify-center font-bold">
              Sl.No
            </div>
            <div className="w-[305px] border-r border-white/40 flex items-center justify-center font-bold">
              Particulars
            </div>
            <div className="w-[78px] border-r border-white/40 flex items-center justify-center font-bold">
              HSN Code
            </div>
            <div className="w-[108px] border-r border-white/40 flex flex-col justify-center text-center">
              <div className="border-b border-white/40 pb-0.5 font-bold">Rate</div>
              <div className="grid grid-cols-2 text-[9px] pt-0.5">
                <span className="border-r border-white/40 font-semibold">Rs.</span>
                <span className="font-semibold">Ps.</span>
              </div>
            </div>
            <div className="w-[55px] border-r border-white/40 flex items-center justify-center font-bold">
              Qty
            </div>
            <div className="flex-1 flex flex-col justify-center text-center">
              <div className="border-b border-white/40 pb-0.5 font-bold">Amount</div>
              <div className="grid grid-cols-2 text-[9px] pt-0.5">
                <span className="border-r border-white/40 font-semibold">Rs.</span>
                <span className="font-semibold">Ps.</span>
              </div>
            </div>
          </div>

          {/* Table Body: Unified Row Structure guaranteeing 100% S.No Row-to-Product Alignment */}
          <div
            className="flex flex-col bg-white"
            style={{
              minHeight: '290px'
            }}
          >
            {/* Render Each Product Item as a self-contained flex row */}
            {items.map((item, idx) => {
              const rateParts = splitRupeesPaise(item.rate || 0);
              const amountParts = splitRupeesPaise(item.amount || 0);

              return (
                <div
                  key={item.id || idx}
                  className="flex items-stretch border-b border-slate-200 min-h-[30px]"
                >
                  {/* Column 1: Sl.No (Directly aligned and centered for this item) */}
                  <div className="w-[50px] border-r border-slate-300 flex items-center justify-center font-bold text-slate-900 text-[10.5px] py-1.5 shrink-0 bg-white">
                    {idx + 1}
                  </div>

                  {/* Column 2: Particulars */}
                  <div className="w-[305px] border-r border-slate-300 px-2.5 py-1.5 flex flex-col justify-center text-left min-w-0 bg-white">
                    <span className="font-bold text-slate-950 text-[10.5px] leading-snug">
                      {item.product_description}
                    </span>
                    {item.serial_number && (
                      <span className="text-[8.5px] text-slate-600 font-mono mt-0.5">
                        S/N: {item.serial_number}
                      </span>
                    )}
                  </div>

                  {/* Column 3: HSN Code */}
                  <div className="w-[78px] border-r border-slate-300 flex items-center justify-center font-mono text-[9.5px] text-slate-800 font-medium py-1.5 shrink-0 bg-white">
                    {item.hsn_code || '84581100'}
                  </div>

                  {/* Column 4: Rate (Rs. & Ps.) */}
                  <div className="w-[108px] border-r border-slate-300 flex items-stretch shrink-0 bg-white">
                    <div className="w-[68px] border-r border-slate-300 pr-2 py-1.5 flex items-center justify-end font-mono font-bold text-slate-900 text-[10px]">
                      {rateParts.rs}
                    </div>
                    <div className="w-[40px] py-1.5 flex items-center justify-center font-mono text-[9px] text-slate-600">
                      {rateParts.ps}
                    </div>
                  </div>

                  {/* Column 5: Qty */}
                  <div className="w-[55px] border-r border-slate-300 flex items-center justify-center font-mono font-bold text-slate-950 text-[10px] py-1.5 shrink-0 bg-white">
                    {item.quantity}
                  </div>

                  {/* Column 6: Amount (Rs. & Ps.) */}
                  <div className="flex-1 flex items-stretch bg-white">
                    <div className="flex-1 pr-2 py-1.5 flex items-center justify-end font-mono font-bold text-slate-900 text-[10.5px]">
                      {amountParts.rs}
                    </div>
                    <div className="w-[42px] border-l border-slate-300 py-1.5 flex items-center justify-center font-mono text-[9px] text-slate-600 shrink-0">
                      {amountParts.ps}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continuous Vertical Lines Filler (Matches physical printed bill stationery) */}
            <div
              className="flex-1 flex items-stretch"
              style={{ minHeight: `${fillerHeightPx}px` }}
            >
              <div className="w-[50px] border-r border-slate-300 shrink-0" />
              <div className="w-[305px] border-r border-slate-300" />
              <div className="w-[78px] border-r border-slate-300 shrink-0" />
              <div className="w-[108px] border-r border-slate-300 flex items-stretch shrink-0">
                <div className="w-[68px] border-r border-slate-300" />
                <div className="w-[40px]" />
              </div>
              <div className="w-[55px] border-r border-slate-300 shrink-0" />
              <div className="flex-1 flex items-stretch">
                <div className="flex-1" />
                <div className="w-[42px] border-l border-slate-300 shrink-0" />
              </div>
            </div>
          </div>

          {/* =======================================================================
              TOTALS & TAX BREAKDOWN GRID (Immediately beneath the table body)
             ======================================================================= */}
          <div className="flex items-stretch border-t border-slate-400 bg-white">
            {/* Left Box: Rupees in words with signature lines (Width matches Sl.No + Particulars + HSN = 433px) */}
            <div
              className="p-2.5 flex flex-col justify-between border-r border-slate-400 bg-white"
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

            {/* Right Box: Tax Breakdown rows (Width matches Rate + Qty + Amount = 309px) */}
            <div className="flex-1 text-[9.5px]">
              {/* Row 1: Quotation Subtotal Before Tax */}
              <div className="flex items-stretch border-b border-slate-300 h-[26px]">
                <div className="w-[163px] px-2 flex items-center font-bold text-slate-800 border-r border-slate-300">
                  Quotation Amount Before Tax
                </div>
                <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-bold text-slate-950">
                  {subtotalParts.rs}
                </div>
                <div className="w-[42px] border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
                  {subtotalParts.ps}
                </div>
              </div>

              {/* Row 2: CGST */}
              <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
                <div className="w-[163px] px-2 flex items-center justify-between border-r border-slate-300">
                  <span className="font-semibold">CGST</span>
                  <div className="flex items-center gap-1 text-[8.5px]">
                    <span className="text-slate-500">@</span>
                    <span className="font-bold">{quotation.cgst_rate || 9}%</span>
                  </div>
                </div>
                <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900">
                  {hasTax && isIntraState ? cgstParts.rs : '0'}
                </div>
                <div className="w-[42px] border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
                  {hasTax && isIntraState ? cgstParts.ps : '00'}
                </div>
              </div>

              {/* Row 3: SGST */}
              <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
                <div className="w-[163px] px-2 flex items-center justify-between border-r border-slate-300">
                  <span className="font-semibold">SGST</span>
                  <div className="flex items-center gap-1 text-[8.5px]">
                    <span className="text-slate-500">@</span>
                    <span className="font-bold">{quotation.sgst_rate || 9}%</span>
                  </div>
                </div>
                <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900">
                  {hasTax && isIntraState ? sgstParts.rs : '0'}
                </div>
                <div className="w-[42px] border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
                  {hasTax && isIntraState ? sgstParts.ps : '00'}
                </div>
              </div>

              {/* Row 4: IGST */}
              <div className="flex items-stretch border-b border-slate-300 h-[24px] text-slate-800">
                <div className="w-[163px] px-2 flex items-center justify-between border-r border-slate-300">
                  <span className="font-semibold">IGST</span>
                  <div className="flex items-center gap-1 text-[8.5px]">
                    <span className="text-slate-500">@</span>
                    <span className="font-bold">{quotation.igst_rate || 18}%</span>
                  </div>
                </div>
                <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-medium text-slate-900">
                  {hasTax && isInterState ? igstParts.rs : '0'}
                </div>
                <div className="w-[42px] border-l border-slate-300 flex items-center justify-center font-mono text-[8.5px] text-slate-600">
                  {hasTax && isInterState ? igstParts.ps : '00'}
                </div>
              </div>

              {/* Row 5: Total Quotation Amount (Solid Soft Blue Highlight Row Matching Bill) */}
              <div
                className="flex items-stretch h-[28px]"
                style={{
                  backgroundColor: '#CCE4F7',
                  borderTop: '1.4px solid #082138'
                }}
              >
                <div className="w-[163px] px-2 flex items-center font-black text-[#082138] text-[11px] border-r border-[#082138]">
                  Quotation Total Amount
                </div>
                <div className="flex-1 text-right pr-2 flex items-center justify-end font-mono font-black text-[12px] text-[#082138]">
                  ₹ {totalParts.rs}
                </div>
                <div className="w-[42px] border-l border-[#082138] flex items-center justify-center font-mono text-[9px] font-bold text-[#082138]">
                  {totalParts.ps}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================================
            SECTION 7: TERMS & CONDITIONS DISCLAIMER (Matching Bill Design Box)
           ======================================================================= */}
        <div
          className="rounded-lg p-2.5 mb-2"
          style={{
            border: '1.4px solid #9CCBF0',
            backgroundColor: '#F4F9FD'
          }}
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

        {/* =======================================================================
            SECTION 8: BANK DETAILS, PARTY GSTIN & AUTHORISED SIGNATORY
           ======================================================================= */}
        <div className="grid grid-cols-12 gap-3 items-end pt-0.5">
          {/* Left: Bank Details Pill Badge & Accounts */}
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

          {/* Center: Party's GSTIN No */}
          <div className="col-span-3 pb-1 border-l border-slate-300 pl-3">
            <div className="flex items-center text-[9.5px] font-bold text-[#082138]">
              <span>Party's GSTIN No</span>
            </div>
            <div className="border-b border-slate-500 mt-2 min-h-[18px] text-[10.5px] font-mono font-bold text-slate-900 pl-1">
              {quotation.customer_gstin || quotation.customer_phone || ''}
            </div>
          </div>

          {/* Right: Company Signature */}
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
      </div>
    </div>
  );
};
