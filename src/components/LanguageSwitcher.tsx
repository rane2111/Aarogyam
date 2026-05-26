import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languageLabels, Language } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={collapsed ? "icon" : "default"} className="w-full justify-start">
          <Globe className="h-4 w-4" />
          {!collapsed && <span className="ml-2">{languageLabels[language]}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(languageLabels) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? "bg-accent" : ""}
          >
            {languageLabels[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
