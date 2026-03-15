import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Avatar,
  Text,
  Box,
  Button,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { FiSettings, FiEdit, FiLogOut } from "react-icons/fi";
import { useI18n, Language } from "../i18n";

interface UserCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
  accentColor: string;
  baseTheme: "light" | "dark";
}

export function UserCardDialog({
  isOpen,
  onClose,
  onSettingsClick,
  onLanguageChange,
  currentLanguage,
  accentColor,
  baseTheme,
}: UserCardDialogProps) {
  const { t } = useI18n();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent
        bg={baseTheme === "dark" ? "#1a1a1a" : "white"}
        borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
        borderWidth="1px"
      >
        <ModalHeader
          borderBottomWidth="1px"
          borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
          color={baseTheme === "dark" ? "white" : "blackAlpha.800"}
        >
          {t("userCard.title")}
        </ModalHeader>
        <ModalCloseButton
          color={baseTheme === "dark" ? "whiteAlpha.700" : "blackAlpha.700"}
          _hover={{ color: accentColor }}
        />

        <ModalBody py={6}>
          <VStack align="stretch" gap={6}>
            <HStack justify="center" gap={4}>
              <Avatar
                size="xl"
                name="User"
                bg={accentColor}
                color="black"
                fontWeight="bold"
              />
              <Box>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={baseTheme === "dark" ? "white" : "blackAlpha.800"}
                >
                  Guest
                </Text>
                <Text
                  fontSize="sm"
                  color={baseTheme === "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
                >
                  {t("userCard.guestUser")}
                </Text>
              </Box>
            </HStack>

            <Divider borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"} />

            <SimpleGrid columns={3} gap={4}>
              <Stat textAlign="center">
                <StatLabel
                  fontSize="xs"
                  color={baseTheme === "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
                >
                  {t("userCard.stats.played")}
                </StatLabel>
                <StatNumber
                  fontSize="xl"
                  fontWeight="bold"
                  color={accentColor}
                >
                  0
                </StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel
                  fontSize="xs"
                  color={baseTheme === "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
                >
                  {t("userCard.stats.favorites")}
                </StatLabel>
                <StatNumber
                  fontSize="xl"
                  fontWeight="bold"
                  color={accentColor}
                >
                  0
                </StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel
                  fontSize="xs"
                  color={baseTheme === "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
                >
                  {t("userCard.stats.downloads")}
                </StatLabel>
                <StatNumber
                  fontSize="xl"
                  fontWeight="bold"
                  color={accentColor}
                >
                  0
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <Divider borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"} />

            <VStack align="stretch" gap={2}>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<FiSettings size={18} />}
                color={baseTheme === "dark" ? "whiteAlpha.800" : "blackAlpha.800"}
                _hover={{
                  bg: baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100",
                  color: accentColor,
                }}
                onClick={() => {
                  onClose();
                  onSettingsClick();
                }}
              >
                {t("userCard.settings")}
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<FiEdit size={18} />}
                color={baseTheme === "dark" ? "whiteAlpha.800" : "blackAlpha.800"}
                _hover={{
                  bg: baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100",
                  color: accentColor,
                }}
                onClick={() => {}}
              >
                {t("userCard.editProfile")}
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<FiLogOut size={18} />}
                color={baseTheme === "dark" ? "whiteAlpha.800" : "blackAlpha.800"}
                _hover={{
                  bg: baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100",
                  color: "#f90e6a",
                }}
                onClick={() => {}}
              >
                {t("userCard.logout")}
              </Button>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
        >
          <Button
            variant="outline"
            borderColor={accentColor}
            color={accentColor}
            _hover={{
              bg: `${accentColor}20`,
            }}
            onClick={onClose}
          >
            {t("userCard.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
