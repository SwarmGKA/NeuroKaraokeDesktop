import { HStack, Avatar, Text, IconButton, Box } from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { useI18n } from "../i18n";

interface UserPanelProps {
  onSettingsClick: () => void;
  onOpenUserCard: () => void;
  accentColor: string;
  baseTheme: "light" | "dark";
}

export function UserPanel({
  onSettingsClick,
  onOpenUserCard,
  accentColor,
  baseTheme,
}: UserPanelProps) {
  const { t } = useI18n();

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
            cursor="pointer"
            onClick={onOpenUserCard}
          />
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            color={baseTheme === "dark" ? "white" : "#1a1a1a"}
            cursor="pointer"
            onClick={onOpenUserCard}
          >
            Guest
          </Text>
        </HStack>

        <IconButton
          aria-label={t("page.settings")}
          icon={<FiSettings size={16} />}
          size="sm"
          variant="ghost"
          color={baseTheme === "dark" ? "whiteAlpha.700" : "blackAlpha.700"}
          _hover={{ color: accentColor }}
          onClick={onSettingsClick}
        />
      </HStack>
    </Box>
  );
}
