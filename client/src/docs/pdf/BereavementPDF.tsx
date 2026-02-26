import type { Member } from "@/types";
import jsPDF from "jspdf";
import { toast } from "sonner";

export const generateBereavementPDF = (members: Member[], selectedMember: string) => {
    const selectedMemberData = members?.find(m => m.id === selectedMember);
    if (!selectedMemberData) {
      toast.error("Please select a member first");
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("TEAM NO STRUGGLE EVOLUTION", pageWidth / 2, 30, { align: "center" });
    
    pdf.setFontSize(16);
    pdf.text("BEREAVEMENT DISBURSEMENT FORM", pageWidth / 2, 45, { align: "center" });
    
    // Draw a line
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, pageWidth - 20, 55);
    
    // Form content
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    
    let yPosition = 75;
    const lineHeight = 8;
    
    // Member Information
    pdf.setFont("helvetica", "bold");
    pdf.text("MEMBER INFORMATION:", 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFont("helvetica", "normal");
    pdf.text(`Member Name: ${selectedMemberData.user.firstName} ${selectedMemberData.user?.lastName}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`TNS Number: ${selectedMemberData.tnsNumber || 'N/A'}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Phone: ${selectedMemberData.user?.phone || 'N/A'}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text(`Email: ${selectedMemberData.user.email || 'N/A'}`, 20, yPosition);
    yPosition += lineHeight + 10;
    
    // Bereavement Details
    pdf.setFont("helvetica", "bold");
    pdf.text("BEREAVEMENT DETAILS:", 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFont("helvetica", "normal");
    const formFields = [
      "Name of Deceased: _________________________________________________",
      "",
      "Relationship to Member: ___________________________________________",
      "",
      "Date of Death: ___________________________________________________",
      "",
      "Place of Death: __________________________________________________",
      "",
      "Cause of Death: __________________________________________________",
      "",
      "Funeral Date: ____________________________________________________",
      "",
      "Funeral Venue: ___________________________________________________",
      "",
      "Next of Kin Name: ________________________________________________",
      "",
      "Next of Kin Phone: _______________________________________________",
      ""
    ];
    
    formFields.forEach(field => {
      pdf.text(field, 20, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += 10;
    
    // Additional Information
    pdf.setFont("helvetica", "bold");
    pdf.text("ADDITIONAL INFORMATION:", 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("Any additional details or special circumstances:", 20, yPosition);
    yPosition += lineHeight;
    
    // Draw lines for writing space
    for (let i = 0; i < 4; i++) {
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += 15;
    
    // Signature Section
    pdf.setFont("helvetica", "bold");
    pdf.text("DECLARATIONS:", 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("Member Signature: _________________________ Date: _______________", 20, yPosition);
    yPosition += lineHeight + 10;
    pdf.text("Witness Signature: ________________________ Date: _______________", 20, yPosition);
    yPosition += lineHeight + 10;
    pdf.text("Treasurer Signature: ______________________ Date: _______________", 20, yPosition);
    
    // Footer
    yPosition += 20;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text("This form must be completed and returned with supporting documents before disbursement.", pageWidth / 2, yPosition, { align: "center" });
    pdf.text(`Form generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 8, { align: "center" });
    
    // Save the PDF
    const fileName = `Bereavement_Form_${selectedMemberData.user.firstName}_${selectedMemberData.user?.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    toast.success("Bereavement form downloaded successfully!");
  };
