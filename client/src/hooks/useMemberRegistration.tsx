import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface MemberInfo {
  name: string;
  email: string;
  idNumber: string;
  phone: string;
  altPhone: string;
  sex: string;
  maritalStatus: string;
  areaOfResidence: string;
  country: string;
  photo: File | null;
}

interface SpouseInfo {
  name: string;
  idNumber: string;
  phone: string;
  altPhone: string;
  sex: string;
  areaOfResidence: string;
  photo: File | null;
}

interface ChildInfo {
  name: string;
  dob: string;
  age: string;
  birthCertificate: File | null;
}

interface ParentInfo {
  name: string;
  idNumber: string;
  phone: string;
  altPhone: string;
  areaOfResidence: string;
}

interface ParentsInfo {
  parent1: ParentInfo;
  parent2: ParentInfo;
}

export const useMemberRegistration = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    name: "",
    email: "",
    idNumber: "",
    phone: "",
    altPhone: "",
    sex: "",
    maritalStatus: "",
    areaOfResidence: "",
    country: "",
    photo: null,
  });
  const [spouseInfo, setSpouseInfo] = useState<SpouseInfo>({
    name: "",
    idNumber: "",
    phone: "",
    altPhone: "",
    sex: "",
    areaOfResidence: "",
    photo: null,
  });
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [parentsInfo, setParentsInfo] = useState<ParentsInfo>({
    parent1: {
      name: "",
      idNumber: "",
      phone: "",
      altPhone: "",
      areaOfResidence: "",
    },
    parent2: {
      name: "",
      idNumber: "",
      phone: "",
      altPhone: "",
      areaOfResidence: "",
    },
  });
  const [transactionId, setTransactionId] = useState("");

  const totalSteps = 6;

  // ---- CHILD HELPERS ----
  const addChild = () => {
    if (children.length < 6) {
      setChildren([
        ...children,
        { name: "", dob: "", age: "", birthCertificate: null },
      ]);
    }
  };
  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };
  const updateChild = (
    index: number,
    field: keyof ChildInfo,
    value: string | File | null,
  ) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };
  const handleFileUpload = (
    file: File | null,
    type: "member" | "spouse" | "child",
    index?: number,
  ) => {
    if (type === "member") setMemberInfo({ ...memberInfo, photo: file });
    else if (type === "spouse") setSpouseInfo({ ...spouseInfo, photo: file });
    else if (type === "child" && index !== undefined)
      updateChild(index, "birthCertificate", file);
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
 
  useEffect(() => {
    // Prepare FormData for file uploads
    const formData = new FormData();

    // Member info
    Object.entries(memberInfo).forEach(([key, value]) => {
      if (value !== null)
        formData.append(`member[${key}]`, value as string | Blob);
    });

    // Spouse info
    if (memberInfo.maritalStatus === "Married") {
      Object.entries(spouseInfo).forEach(([key, value]) => {
        if (value !== null)
          formData.append(`spouse[${key}]`, value as string | Blob);
      });
    }

    // Children
    children.forEach((child, index) => {
      Object.entries(child).forEach(([key, value]) => {
        if (value !== null)
          formData.append(`children[${index}][${key}]`, value as string | Blob);
      });
    });

    // Parents
    Object.entries(parentsInfo).forEach(([parentKey, parent]) => {
      Object.entries(parent).forEach(([key, value]) => {
        if (value !== null)
          formData.append(`${parentKey}[${key}]`, value as string);
      });
    });

    // Transaction ID
    formData.append("transactionId", transactionId);
    console.log("✔️😂✔️", formData.getAll);
  }, []);

  // ---- REACT QUERY MUTATION ----
  // const mutation = useMutation({
  //   mutationFn: async () => {

  //     const response = await fetch("/api/registrations", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       const text = await response.text();
  //       throw new Error(text || "Registration failed");
  //     }

  //     return response.json();
  //   },
  //   onSuccess: (data) => {
  //     toast({
  //       title: "Registration Submitted!",
  //       description:
  //         "Your registration was successful. Our team will contact you shortly.",
  //     });
  //     // Reset form
  //     setCurrentStep(1);
  //     setMemberInfo({
  //       name: "",
  //       email: "",
  //       idNumber: "",
  //       phone: "",
  //       altPhone: "",
  //       sex: "",
  //       maritalStatus: "",
  //       areaOfResidence: "",
  //       country: "",
  //       photo: null,
  //     });
  //     setSpouseInfo({
  //       name: "",
  //       idNumber: "",
  //       phone: "",
  //       altPhone: "",
  //       sex: "",
  //       areaOfResidence: "",
  //       photo: null,
  //     });
  //     setChildren([]);
  //     setParentsInfo({
  //       parent1: {
  //         name: "",
  //         idNumber: "",
  //         phone: "",
  //         altPhone: "",
  //         areaOfResidence: "",
  //       },
  //       parent2: {
  //         name: "",
  //         idNumber: "",
  //         phone: "",
  //         altPhone: "",
  //         areaOfResidence: "",
  //       },
  //     });
  //     setTransactionId("");
  //   },
  //   onError: (error: any) => {
  //     toast({
  //       title: "Registration Failed",
  //       description:
  //         error?.message || "Something went wrong. Please try again.",
  //       variant: "destructive",
  //     });
  //   },
  // });

  // ---- SUBMIT HANDLER ----
  const handleSubmit = () => {
    // mutation.mutate();
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    memberInfo,
    setMemberInfo,
    spouseInfo,
    setSpouseInfo,
    children,
    addChild,
    removeChild,
    updateChild,
    parentsInfo,
    setParentsInfo,
    handleFileUpload,
    transactionId,
    setTransactionId,
    handleSubmit,
    isSubmitting: mutation.isPending,
  };
};
