type P = { className?: string; size?: number };

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconBed = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
    <path d="M2 16h20" />
    <path d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
  </svg>
);

export const IconBath = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 12V6a2 2 0 0 1 3.4-1.4L9 6" />
    <path d="M2 12h20v3a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" />
    <path d="M7 20l-1 2M17 20l1 2" />
  </svg>
);

export const IconArea = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 3h18v18H3z" />
    <path d="M9 3v6H3M21 15h-6v6" />
  </svg>
);

export const IconPin = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconArrowRight = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconArrowLeft = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const IconClose = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconExpand = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const IconCar = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 17h14M3 13l2-5a2 2 0 0 1 2-1.3h10A2 2 0 0 1 19 8l2 5v4H3z" />
    <circle cx="7.5" cy="17" r="1.5" />
    <circle cx="16.5" cy="17" r="1.5" />
  </svg>
);

export const IconCheck = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export const IconPhone = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const IconWhatsapp = ({ className, size = 18 }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.06c-.17-.3 0-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.7h-.01a9.6 9.6 0 0 1-4.88-1.34l-.35-.2-3.63.95.97-3.54-.23-.36a9.58 9.58 0 0 1-1.47-5.11 9.62 9.62 0 0 1 16.43-6.8 9.55 9.55 0 0 1 2.82 6.81 9.62 9.62 0 0 1-9.65 9.6M20.5 3.49A11.55 11.55 0 0 0 12.05 0C5.64 0 .42 5.21.42 11.62c0 2.05.53 4.05 1.55 5.81L.32 24l6.72-1.76a11.6 11.6 0 0 0 5.01 1.2h.01c6.4 0 11.62-5.21 11.62-11.62 0-3.1-1.2-6.02-3.4-8.21" />
  </svg>
);
