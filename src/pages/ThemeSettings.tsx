import { VStack, Box, Text, Card, CardBody, CardHeader, Button, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { useI18n, Language } from "../i18n";

export type BaseTheme = "light" | "dark";
export type AccentTheme = "neuro" | "neuro-evil" | "evil";

interface ThemeSettingsProps {
  baseTheme: BaseTheme;
  accentTheme: AccentTheme;
  language: Language;
  onBaseThemeChange: (theme: BaseTheme) => void;
  onAccentThemeChange: (theme: AccentTheme) => void;
  onLanguageChange: (lang: Language) => void;
}

const accentColors = {
  neuro: { color: "#40d8ff", label: "settings.accent.neuro" },
  "neuro-evil": { color: "#a057ff", label: "settings.accent.neuroEvil" },
  evil: { color: "#f90e6a", label: "settings.accent.evil" },
};

export function ThemeSettings({
  baseTheme,
  accentTheme,
  language,
  onBaseThemeChange,
  onAccentThemeChange,
  onLanguageChange,
}: ThemeSettingsProps) {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={8} p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {t("page.settings")}
        </Text>
        <Text color={baseTheme === "light" ? "blackAlpha.600" : "gray.400"}>{t("settings.appearance")}</Text>
      </Box>

      {/* Theme Selection */}
      <Card bg={baseTheme === "light" ? "blackAlpha.50" : "whiteAlpha.50"} borderColor={baseTheme === "light" ? "blackAlpha.100" : "whiteAlpha.100"} borderWidth="1px">
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold" color={baseTheme === "light" ? "blackAlpha.800" : "whiteAlpha.800"}>
            {t("settings.theme")}
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <RadioGroup value={baseTheme} onChange={(value) => onBaseThemeChange(value as BaseTheme)}>
            <Stack direction="row" gap={6}>
              <Radio value="light">{t("settings.theme.light")}</Radio>
              <Radio value="dark">{t("settings.theme.dark")}</Radio>
            </Stack>
          </RadioGroup>
        </CardBody>
      </Card>

      {/* Accent Color Selection */}
      <Card bg={baseTheme === "light" ? "blackAlpha.50" : "whiteAlpha.50"} borderColor={baseTheme === "light" ? "blackAlpha.100" : "whiteAlpha.100"} borderWidth="1px">
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold" color={baseTheme === "light" ? "blackAlpha.800" : "whiteAlpha.800"}>
            {t("settings.accentColor")}
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack align="stretch" gap={3}>
            {(Object.keys(accentColors) as AccentTheme[]).map((key) => {
              const { color, label } = accentColors[key];
              const isActive = accentTheme === key;

              return (
                <Button
                  key={key}
                  variant={isActive ? "solid" : "outline"}
                  justifyContent="flex-start"
                  leftIcon={
                    <Box
                      w={5}
                      h={5}
                      borderRadius="full"
                      bg={color}
                      border="2px solid"
                      borderColor={isActive ? (baseTheme === "light" ? "blackAlpha.800" : "white") : (baseTheme === "light" ? "blackAlpha.300" : "whiteAlpha.300")}
                    />
                  }
                  bg={isActive ? `${color}30` : undefined}
                  borderColor={isActive ? color : (baseTheme === "light" ? "blackAlpha.200" : "whiteAlpha.200")}
                  color={isActive ? color : (baseTheme === "light" ? "blackAlpha.800" : "whiteAlpha.800")}
                  _hover={{
                    bg: isActive ? `${color}40` : (baseTheme === "light" ? "blackAlpha.100" : "whiteAlpha.100"),
                  }}
                  onClick={() => onAccentThemeChange(key)}
                >
                  {t(label)}
                </Button>
              );
            })}
          </VStack>
        </CardBody>
      </Card>

      {/* Language Selection */}
      <Card bg={baseTheme === "light" ? "blackAlpha.50" : "whiteAlpha.50"} borderColor={baseTheme === "light" ? "blackAlpha.100" : "whiteAlpha.100"} borderWidth="1px">
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold" color={baseTheme === "light" ? "blackAlpha.800" : "whiteAlpha.800"}>
            {t("settings.language")}
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <RadioGroup value={language} onChange={(value) => onLanguageChange(value as Language)}>
            <Stack direction="row" gap={6}>
              <Radio value="zh">{t("settings.language.zh")}</Radio>
              <Radio value="en">{t("settings.language.en")}</Radio>
            </Stack>
          </RadioGroup>
        </CardBody>
      </Card>
    </VStack>
  );
}
