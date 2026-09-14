import logging

from app.agents.document_agent import DocumentProcessor
from app.agents.extraction_agent import ExtractionProcessor

logger = logging.getLogger(__name__)


class PipelineService:

    @staticmethod
    async def process_document(
        document_id: str,
        file_path: str,
        company_name: str,
    ):
        """
        Runs the document processing and extraction pipeline.
        """

        logger.info(
            f"Starting pipeline for document {document_id}"
        )

        try:

            # -------------------------------------------------
            # STEP 1: Document Agent
            # -------------------------------------------------

            logger.info(
                f"[1/2] Processing document {document_id}"
            )

            await DocumentProcessor.process_document(
                document_id,
                file_path,
            )

            logger.info(
                f"[1/2] Document processing completed: {document_id}"
            )

            # -------------------------------------------------
            # STEP 2: Extraction Agent
            # -------------------------------------------------

            logger.info(
                f"[2/2] Extracting financial metrics: {document_id}"
            )

            extraction_result = (
                await ExtractionProcessor.process_extraction(
                    document_id,
                    company_name,
                )
            )

            logger.info(
                f"[2/2] Extraction completed: {document_id}"
            )

            return extraction_result

        except Exception as e:

            logger.exception(
                f"Pipeline failed for {document_id}: {e}"
            )

            raise