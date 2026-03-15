import { VStack, Box, Text, Card, CardBody } from "@chakra-ui/react";
import { useI18n } from "../i18n";

export function About() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={8} p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {t("page.about")}
        </Text>
        <Text color="gray.400">关于 Neuro Karaoke</Text>
      </Box>

      <Card bg="whiteAlpha.50" borderColor="whiteAlpha.100" borderWidth="1px">
        <CardBody>
          <Text color="gray.300">应用信息</Text>
        </CardBody>
      </Card>
    </VStack>
  );
}
