import { VStack, Box, Text, Card, CardBody } from "@chakra-ui/react";
import { useI18n } from "../i18n";

export function ListenTogether() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={8} p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {t("page.listenTogether")}
        </Text>
        <Text color="gray.400">一起听音乐</Text>
      </Box>

      <Card bg="whiteAlpha.50" borderColor="whiteAlpha.100" borderWidth="1px">
        <CardBody>
          <Text color="gray.300">一起听功能</Text>
        </CardBody>
      </Card>
    </VStack>
  );
}
