
export const PrimaryButton = ({ children, onClick }: { children: string, onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center h-8 px-4 text-xs font-medium rounded-md border border-white/10 bg-white/5 text-white/55 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-150 select-none"
    >
      {children}
    </button>
  );
};

export const SuccessButton = ({ children, onClick }: { children: string, onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center h-8 px-4 text-xs font-medium rounded-md border border-white/10 bg-white/5 text-white/55 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-150 select-none"
    >
      {children}
    </button>
  );
};
