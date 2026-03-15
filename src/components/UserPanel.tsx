import { HStack, Avatar, Text, IconButton, Box } from "@chakra-ui/react";
import { FiSettings, FiGlobe } from "react-icons/fi";
import { useI18n, Language } from "../i18n";

interface UserPanelProps {
  onSettingsClick: () => void;
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
  accentColor: string;
  baseTheme: "light" | "dark";
}

export function UserPanel({
  onSettingsClick,
  onLanguageChange,
  currentLanguage,
  accentColor,
  baseTheme,
}: UserPanelProps) {
  const { t } = useI18n();

  const toggleLanguage = () => {
    const newLang = currentLanguage === "zh" ? "en" : "zh";
    onLanguageChange(newLang);
  };

  return (
    <Box
      w="full"
      p={3}
      borderTopWidth="1px"
      borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
      bg={baseTheme === "dark" ? "#1a1a1a" : "#fafafa"}
    >
      <HStack justify="space-between" align="center">
        <HStack gap={2}>
          <Avatar
            size="sm"
            name="User"
            bg={accentColor}
            color="black"
            fontWeight="bold"
          />
          <Text fontSize="sm" fontWeight="medium" color={baseTheme === "dark" ? "white" : "#1a1a1a"}>
            Guest
          </Text>
        </HStack>

        <HStack gap={1}>
          <IconButton
            aria-label={t("page.settings")}
            icon={<FiSettings size={16} />}
            size="sm"
            variant="ghost"
            color={baseTheme === "dark" ? "whiteAlpha.700" : "blackAlpha.700"}
            _hover={{ color: accentColor }}
            onClick={onSettingsClick}
          />
          <IconButton
            aria-label={t("settings.language")}
            icon={<FiGlobe size={16} />}
            size="sm"
            variant="ghost"
            color={baseTheme === "dark" ? "whiteAlpha.700" : "blackAlpha.700"}
            _hover={{ color: accentColor }}
            onClick={toggleLanguage}
          />
        </HStack>
      </HStack>
    </Box>
  );
}
