import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  link: string;
  onClick?: () => void | Promise<void>;
}

function BackButton({ link, onClick }: BackButtonProps) {
  const Navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handleClick = async () => {
      if (onClick) {
        await onClick();
      }
      Navigate(link);
    };

    tg.ready();
    tg.BackButton.show();
    tg.BackButton.onClick(handleClick);

    return () => {
      tg.BackButton.offClick(handleClick);
      tg.BackButton.hide();
    };
  }, [link, onClick, Navigate]);
}

export default BackButton;
