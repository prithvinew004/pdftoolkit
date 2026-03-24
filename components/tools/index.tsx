"use client";
import { Tool, ToolType } from "@/data/tools";
import ConvertTool from "./ConvertTool";
import MergeTool from "./MergeTool";
import SplitTool from "./SplitTool";
import CompressTool from "./CompressTool";
import RotateTool from "./RotateTool";
import ExtractTool from "./ExtractTool";
import PageNumbersTool from "./PageNumbersTool";
import WatermarkTool from "./WatermarkTool";
import PasswordAddTool from "./PasswordAddTool";
import PasswordRemoveTool from "./PasswordRemoveTool";
import EncryptTool from "./EncryptTool";
import EditTextTool from "./EditTextTool";
import AddTextTool from "./AddTextTool";
import AddImageTool from "./AddImageTool";
import AnnotateTool from "./AnnotateTool";
import HighlightTool from "./HighlightTool";
import SignatureTool from "./SignatureTool";
import AiSummaryTool from "./AiSummaryTool";

const toolComponents: Record<ToolType, React.ComponentType<{ tool: Tool }>> = {
  convert: ConvertTool,
  merge: MergeTool,
  split: SplitTool,
  compress: CompressTool,
  rotate: RotateTool,
  extract: ExtractTool,
  "page-numbers": PageNumbersTool,
  watermark: WatermarkTool,
  "password-add": PasswordAddTool,
  "password-remove": PasswordRemoveTool,
  encrypt: EncryptTool,
  "edit-text": EditTextTool,
  "add-text": AddTextTool,
  "add-image": AddImageTool,
  annotate: AnnotateTool,
  highlight: HighlightTool,
  signature: SignatureTool,
  "ai-summary": AiSummaryTool,
};

export default function ToolInterface({ tool }: { tool: Tool }) {
  const Component = toolComponents[tool.toolType];
  return <Component tool={tool} />;
}
