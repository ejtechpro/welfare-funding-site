import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Heart,
  User,
  Baby,
  UserCheck,
  Receipt,
  Globe,
} from "lucide-react";
import axios from "axios";
import { processFile } from "@/utils/imageCompressor";

const apiUrl = import.meta.env.VITE_API_URL;

interface MemberInfo {
  firstName: string;
  lastName: string;
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

const MultiStepRegistration = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const [memberInfo, setMemberInfo] = useState<MemberInfo>({
    firstName: "",
    lastName: "",
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
  // Check if phone number format is valid
  const phoneRegex =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

  // Validation functions
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!memberInfo.country) {
          toast({
            title: "Validation Error",
            description: "Please select your country",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 2:
        if (!memberInfo.firstName?.trim()) {
          toast({
            title: "Validation Error",
            description: "First name is required",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.lastName?.trim()) {
          toast({
            title: "Validation Error",
            description: "Last name is required",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.email?.trim()) {
          toast({
            title: "Validation Error",
            description: "Email address is required",
            variant: "destructive",
          });
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberInfo.email)) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.idNumber?.trim()) {
          toast({
            title: "Validation Error",
            description: "ID number is required",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.phone?.trim()) {
          toast({
            title: "Validation Error",
            description: "Phone number is required",
            variant: "destructive",
          });
          return false;
        }

        if (!phoneRegex.test(memberInfo.phone.replace(/\s/g, ""))) {
          toast({
            title: "Validation Error",
            description:
              "Please enter a valid phone number (e.g., 123-456-7890, +1234567890)",
            variant: "destructive",
          });
          return false;
        }
        if (memberInfo.altPhone != "") {
          if (!phoneRegex.test(memberInfo.altPhone.replace(/\s/g, ""))) {
            toast({
              title: "Validation Error",
              description:
                "Please enter a valid alternative phone number (e.g., 123-456-7890, +1234567890)",
              variant: "destructive",
            });
            return false;
          }
        }
        if (!memberInfo.sex) {
          toast({
            title: "Validation Error",
            description: "Please select your sex",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.maritalStatus) {
          toast({
            title: "Validation Error",
            description: "Please select marital status",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.areaOfResidence?.trim()) {
          toast({
            title: "Validation Error",
            description: "Area of residence is required",
            variant: "destructive",
          });
          return false;
        }
        if (!memberInfo.photo) {
          toast({
            title: "Validation Error",
            description: "Please upload a photo",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 3:
        if (memberInfo.maritalStatus === "married") {
          if (!spouseInfo.name?.trim()) {
            toast({
              title: "Validation Error",
              description: "Spouse name is required",
              variant: "destructive",
            });
            return false;
          }
          if (!spouseInfo.idNumber?.trim()) {
            toast({
              title: "Validation Error",
              description: "Spouse ID number is required",
              variant: "destructive",
            });
            return false;
          }

          if (!spouseInfo.phone?.trim()) {
            toast({
              title: "Validation Error",
              description: "Spouse phone number is required",
              variant: "destructive",
            });
            return false;
          }

          if (!phoneRegex.test(spouseInfo.phone.replace(/\s/g, ""))) {
            toast({
              title: "Validation Error",
              description:
                "Please enter a valid phone number (e.g., 123-456-7890, +1234567890)",
              variant: "destructive",
            });
            return false;
          }

          if (spouseInfo.altPhone != "") {
            if (!phoneRegex.test(spouseInfo.altPhone.replace(/\s/g, ""))) {
              toast({
                title: "Validation Error",
                description:
                  "Please enter a valid alternative phone number (e.g., 123-456-7890, +1234567890)",
                variant: "destructive",
              });
              return false;
            }
          }
          if (!spouseInfo.sex) {
            toast({
              title: "Validation Error",
              description: "Please select spouse's sex",
              variant: "destructive",
            });
            return false;
          }
          if (!spouseInfo.areaOfResidence?.trim()) {
            toast({
              title: "Validation Error",
              description: "Spouse area of residence is required",
              variant: "destructive",
            });
            return false;
          }
          if (!spouseInfo.photo) {
            toast({
              title: "Validation Error",
              description: "Please upload spouse's photo",
              variant: "destructive",
            });
            return false;
          }
        }
        return true;

      case 4:
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child.name?.trim()) {
            toast({
              title: "Validation Error",
              description: `Child ${i + 1} name is required`,
              variant: "destructive",
            });
            return false;
          }
          if (!child.dob) {
            toast({
              title: "Validation Error",
              description: `Child ${i + 1} date of birth is required`,
              variant: "destructive",
            });
            return false;
          }
          if (!child.age?.trim()) {
            toast({
              title: "Validation Error",
              description: `Child ${i + 1} age is required`,
              variant: "destructive",
            });
            return false;
          }

          if (!/^\d+$/.test(child.age.trim())) {
            toast({
              title: "Validation Error",
              description: `Child ${i + 1} age must contain only digits`,
              variant: "destructive",
            });
            return false;
          }

          const age = parseInt(child.age.trim(), 10);
          if (age < 0 || age > 120) {
            toast({
              title: "Validation Error",
              description: `Child ${i + 1} age must be between 0 and 120`,
              variant: "destructive",
            });
            return false;
          }
          if (!child.birthCertificate) {
            toast({
              title: "Validation Error",
              description: `Child ${i + 1} birth certificate is required`,
              variant: "destructive",
            });
            return false;
          }
        }
        return true;

      case 5:
        if (!parentsInfo.parent1.name?.trim()) {
          toast({
            title: "Validation Error",
            description: "Parent 1 name is required",
            variant: "destructive",
          });
          return false;
        }
        if (!parentsInfo.parent1.idNumber?.trim()) {
          toast({
            title: "Validation Error",
            description: "Parent 1 ID number is required",
            variant: "destructive",
          });
          return false;
        }
        if (!parentsInfo.parent1.phone?.trim()) {
          toast({
            title: "Validation Error",
            description: "Parent 1 phone number is required",
            variant: "destructive",
          });
          return false;
        }

        if (!phoneRegex.test(parentsInfo.parent1.altPhone.replace(/\s/g, ""))) {
          toast({
            title: "Validation Error",
            description:
              "Please enter a valid alternative phone number (e.g., 123-456-7890, +1234567890)",
            variant: "destructive",
          });
          return false;
        }

        if (parentsInfo.parent1.altPhone != "") {
          if (
            !phoneRegex.test(parentsInfo.parent1.altPhone.replace(/\s/g, ""))
          ) {
            toast({
              title: "Validation Error",
              description:
                "Please enter a valid alternative phone number (e.g., 123-456-7890, +1234567890)",
              variant: "destructive",
            });
            return false;
          }
        }
        if (!parentsInfo.parent1.areaOfResidence?.trim()) {
          toast({
            title: "Validation Error",
            description: "Parent 1 area of residence is required",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 6:
        if (!transactionId?.trim()) {
          toast({
            title: "Validation Error",
            description: "Transaction ID is required",
            variant: "destructive",
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

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
    const updatedChildren = [...children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setChildren(updatedChildren);
  };

  const handleFileUpload = (
    file: File | null,
    type: "member" | "spouse" | "child",
    index?: number,
  ) => {
    if (type === "member") {
      setMemberInfo({ ...memberInfo, photo: file });
    } else if (type === "spouse") {
      setSpouseInfo({ ...spouseInfo, photo: file });
    } else if (type === "child" && index !== undefined) {
      updateChild(index, "birthCertificate", file);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetInputs = () => {
    // Reset form
    setCurrentStep(1);
    setMemberInfo({
      firstName: "",
      lastName: "",
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
    setSpouseInfo({
      name: "",
      idNumber: "",
      phone: "",
      altPhone: "",
      sex: "",
      areaOfResidence: "",
      photo: null,
    });
    setChildren([]);
    setParentsInfo({
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
    setTransactionId("");
  };

  const memberSignIn = async (data: any) => {
    const formData = new FormData();

    // send objects as JSON
    formData.append("memberInfo", JSON.stringify(data.memberInfo));
    formData.append("spouseInfo", JSON.stringify(data.spouseInfo));
    formData.append("children", JSON.stringify(data.children));
    formData.append("parentsInfo", JSON.stringify(data.parentsInfo));
    formData.append("transactionId", data.transactionId);

    // Member photo
    if (data.memberInfo.photo) {
      const memberPhoto = await data.memberInfo.photo;
      if (memberPhoto) formData.append("memberPhoto", memberPhoto);
    }

    // Spouse photo
    if (data.spouseInfo.photo) {
      const spousePhoto = await processFile(data.spouseInfo.photo);
      if (spousePhoto) formData.append("spousePhoto", spousePhoto);
    }

    for (let i = 0; i < data.children.length; i++) {
      const birthCert = data.children[i].birthCertificate;

      if (birthCert instanceof File) {
        const certFile = await processFile(birthCert);
        formData.append(`childBirthCert_${i}`, certFile);
      }
    }

    const res = await axios.post(`${apiUrl}/member-auth/new`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return res.data;
  };

  const mutation = useMutation({
    mutationFn: async () =>
      memberSignIn({
        memberInfo,
        spouseInfo,
        children,
        parentsInfo,
        transactionId,
      }),

    onSuccess: (data) => {
      if (data?.success) {
        toast({
          title: "Registration Submitted!",
          description: `Your member registration has been submitted successfully.`,
        });
        resetInputs();
      }
    },
    onError: (err: any) => {
      if (err?.response?.data.error) {
        toast({
          title: "Registration Failed",
          description: err?.response?.data.error,
        });
      } else {
        toast({
          title: "Registration Failed!",
          description: `"Failed to submit registration. Please try again.",`,
        });
      }
    },
  });

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      mutation.mutate();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <Globe className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Country Selection
              </h3>
              <p className="text-muted-foreground">
                Please select your country of residence
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberCountry">Country *</Label>
              <Select
                onValueChange={(value) =>
                  setMemberInfo({ ...memberInfo, country: value })
                }
                value={memberInfo.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Member Information
              </h3>
              <p className="text-muted-foreground">
                Please provide your personal details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberFirstName">First Name *</Label>
                <Input
                  id="memberFirstName"
                  value={memberInfo.firstName}
                  onChange={(e) =>
                    setMemberInfo({ ...memberInfo, firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberLastName">Last Name *</Label>
                <Input
                  id="memberLastName"
                  value={memberInfo.lastName}
                  onChange={(e) =>
                    setMemberInfo({ ...memberInfo, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberEmail">Email Address *</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  value={memberInfo.email}
                  onChange={(e) =>
                    setMemberInfo({ ...memberInfo, email: e.target.value })
                  }
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberIdNumber">ID Number *</Label>
                <Input
                  id="memberIdNumber"
                  value={memberInfo.idNumber}
                  onChange={(e) =>
                    setMemberInfo({ ...memberInfo, idNumber: e.target.value })
                  }
                  placeholder="Enter your ID number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberPhone">Phone Number *</Label>
                <Input
                  id="memberPhone"
                  value={memberInfo.phone}
                  onChange={(e) =>
                    setMemberInfo({ ...memberInfo, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberAltPhone">Alternative Phone</Label>
                <Input
                  id="memberAltPhone"
                  value={memberInfo.altPhone}
                  onChange={(e) =>
                    setMemberInfo({ ...memberInfo, altPhone: e.target.value })
                  }
                  placeholder="Alternative phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberSex">Sex *</Label>
                <Select
                  onValueChange={(value) =>
                    setMemberInfo({ ...memberInfo, sex: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberMaritalStatus">Marital Status *</Label>
                <Select
                  onValueChange={(value) =>
                    setMemberInfo({ ...memberInfo, maritalStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberArea">Area of Residence *</Label>
              <Input
                id="memberArea"
                value={memberInfo.areaOfResidence}
                onChange={(e) =>
                  setMemberInfo({
                    ...memberInfo,
                    areaOfResidence: e.target.value,
                  })
                }
                placeholder="e.g., Nairobi, Kampala, London, etc."
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter your city or area. You can also include state/region
                (e.g., "Boston, Massachusetts")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberPhoto">Upload Photo *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="memberPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] || null, "member")
                  }
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("memberPhoto")?.click()
                  }
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {memberInfo.photo ? memberInfo.photo.name : "Choose Photo"}
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Spouse Information
              </h3>
              <p className="text-muted-foreground">
                Please provide your spouse's details (if married)
              </p>
            </div>

            {memberInfo.maritalStatus === "married" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spouseName">Spouse Full Name *</Label>
                    <Input
                      id="spouseName"
                      value={spouseInfo.name}
                      onChange={(e) =>
                        setSpouseInfo({ ...spouseInfo, name: e.target.value })
                      }
                      placeholder="Enter spouse's full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouseIdNumber">Spouse ID Number *</Label>
                    <Input
                      id="spouseIdNumber"
                      value={spouseInfo.idNumber}
                      onChange={(e) =>
                        setSpouseInfo({
                          ...spouseInfo,
                          idNumber: e.target.value,
                        })
                      }
                      placeholder="Enter spouse's ID number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spousePhone">Spouse Phone Number *</Label>
                    <Input
                      id="spousePhone"
                      value={spouseInfo.phone}
                      onChange={(e) =>
                        setSpouseInfo({ ...spouseInfo, phone: e.target.value })
                      }
                      placeholder="Enter spouse's phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouseAltPhone">
                      Spouse Alternative Phone
                    </Label>
                    <Input
                      id="spouseAltPhone"
                      value={spouseInfo.altPhone}
                      onChange={(e) =>
                        setSpouseInfo({
                          ...spouseInfo,
                          altPhone: e.target.value,
                        })
                      }
                      placeholder="Alternative phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouseSex">Spouse Sex *</Label>
                    <Select
                      onValueChange={(value) =>
                        setSpouseInfo({ ...spouseInfo, sex: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spouseArea">
                      Spouse Area of Residence *
                    </Label>
                    <Input
                      id="spouseArea"
                      value={spouseInfo.areaOfResidence}
                      onChange={(e) =>
                        setSpouseInfo({
                          ...spouseInfo,
                          areaOfResidence: e.target.value,
                        })
                      }
                      placeholder="Enter spouse's area of residence"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spousePhoto">Upload Spouse Photo *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="spousePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0] || null, "spouse")
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("spousePhoto")?.click()
                      }
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {spouseInfo.photo
                        ? spouseInfo.photo.name
                        : "Choose Spouse Photo"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  This section is only required if you are married. You can
                  proceed to the next step.
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <Baby className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Children Information
              </h3>
              <p className="text-muted-foreground">
                Add up to 6 children (if applicable)
              </p>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-foreground">
                Children ({children.length}/6)
              </h4>
              {children.length < 6 && (
                <Button onClick={addChild} variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              )}
            </div>

            {children.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No children added yet. Click "Add Child" to include children
                  in your registration.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {children.map((child, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-lg font-semibold text-foreground">
                          Child {index + 1}
                        </h5>
                        <Button
                          onClick={() => removeChild(index)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Child Name *</Label>
                          <Input
                            value={child.name}
                            onChange={(e) =>
                              updateChild(index, "name", e.target.value)
                            }
                            placeholder="Enter child's name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date of Birth *</Label>
                          <Input
                            type="date"
                            value={child.dob}
                            onChange={(e) =>
                              updateChild(index, "dob", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Age *</Label>
                          <Input
                            value={child.age}
                            onChange={(e) =>
                              updateChild(index, "age", e.target.value)
                            }
                            placeholder="Enter age"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Birth Certificate *</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`childCert${index}`}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files?.[0] || null,
                                "child",
                                index,
                              )
                            }
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document
                                .getElementById(`childCert${index}`)
                                ?.click()
                            }
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {child.birthCertificate
                              ? child.birthCertificate.name
                              : "Upload Birth Certificate"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <UserCheck className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Parents Information
              </h3>
              <p className="text-muted-foreground">
                Please provide information for your parents
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Parent 1 */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Parent 1 Information
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Parent Names *</Label>
                    <Input
                      value={parentsInfo.parent1.name}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent1: {
                            ...parentsInfo.parent1,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent names"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent ID Numbers *</Label>
                    <Input
                      value={parentsInfo.parent1.idNumber}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent1: {
                            ...parentsInfo.parent1,
                            idNumber: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent ID numbers"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Phone Numbers *</Label>
                    <Input
                      value={parentsInfo.parent1.phone}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent1: {
                            ...parentsInfo.parent1,
                            phone: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent phone numbers"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Alternative Phones</Label>
                    <Input
                      value={parentsInfo.parent1.altPhone}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent1: {
                            ...parentsInfo.parent1,
                            altPhone: e.target.value,
                          },
                        })
                      }
                      placeholder="Alternative phone numbers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Areas of Residence *</Label>
                    <Input
                      value={parentsInfo.parent1.areaOfResidence}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent1: {
                            ...parentsInfo.parent1,
                            areaOfResidence: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent areas of residence"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Parent 2 */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Parent 2 Information (Optional)
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Parent Names</Label>
                    <Input
                      value={parentsInfo.parent2.name}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent2: {
                            ...parentsInfo.parent2,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent names"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent ID Numbers</Label>
                    <Input
                      value={parentsInfo.parent2.idNumber}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent2: {
                            ...parentsInfo.parent2,
                            idNumber: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent ID numbers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Phone Numbers</Label>
                    <Input
                      value={parentsInfo.parent2.phone}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent2: {
                            ...parentsInfo.parent2,
                            phone: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent phone numbers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Alternative Phones</Label>
                    <Input
                      value={parentsInfo.parent2.altPhone}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent2: {
                            ...parentsInfo.parent2,
                            altPhone: e.target.value,
                          },
                        })
                      }
                      placeholder="Alternative phone numbers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Areas of Residence</Label>
                    <Input
                      value={parentsInfo.parent2.areaOfResidence}
                      onChange={(e) =>
                        setParentsInfo({
                          ...parentsInfo,
                          parent2: {
                            ...parentsInfo.parent2,
                            areaOfResidence: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter parent areas of residence"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full">
                  <Receipt className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Payment Proof
              </h3>
              <p className="text-muted-foreground">
                Provide transaction ID for your registration fee payment
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 mb-6">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Registration Fee
                </h4>
                <div className="text-3xl font-bold text-primary mb-2">
                  Ksh 1000
                </div>
                <p className="text-muted-foreground">
                  One-time administrative fee to join Team No Struggle
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">
                Transaction ID of Registration Fee Payment *
              </Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your MPESA transaction ID (e.g., MDHBBEBEBEB)"
                required
              />
              <p className="text-sm text-muted-foreground">
                Please provide the transaction ID from your Ksh 1000
                registration fee payment
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">
                Payment Instructions:
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pay Ksh 1000 to our official payment account</li>
                <li>
                  • Note down the transaction ID from your payment receipt
                </li>
                <li>• Enter the transaction ID in the field above</li>
                <li>• Keep your payment receipt for your records</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="register" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Member <span className="text-primary">Registration</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Complete the multi-step registration form to join our supportive
            community
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      i + 1 <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`h-1 w-full mx-2 ${
                        i + 1 < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Country</span>
              <span>Personal</span>
              <span>Spouse</span>
              <span>Children</span>
              <span>Parents</span>
              <span>Payment</span>
            </div>
          </div>

          <Card className="shadow-medium border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground text-center">
                Step {currentStep} of {totalSteps}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {renderStepContent()}

              <div className="flex justify-between pt-8">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={mutation.isPending || !transactionId}
                    className="bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Submit Registration
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={nextStep}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MultiStepRegistration;
