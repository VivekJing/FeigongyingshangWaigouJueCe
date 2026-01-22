import { request } from '../index';

type Params = Parameters<typeof request>;

const VISIALFORCE = 'OutsourcingDecision';
const instance = <T>(
  action: Params[0],
  args?: Params[1],
  config?: Params[2]
) => {
  return request<T>(action, args, config, VISIALFORCE)
    .then((data) => [undefined, data] as [undefined, T])
    .catch((error) => [error, undefined] as [string, undefined]);
};

export type PickList = {
  label: string;
  value: string;
};

export enum Role {
  '供应商' = '供应商',
  '供应商加签人' = '供应商加签人',
  '业务单元' = '业务单元',
  '业务单元加签人' = '业务单元加签人',
  '合规' = '合规',
  '合规加签人' = '合规加签人',
  '省区经理' = '省区经理',
  '省区经理加签人' = '省区经理加签人',
}

interface Response {
  data: {
    Id: string | null;
    Name: string | null;
    Owner: string | null;
    OwnerId: string | null;
    ApplicationTime: string | null;
    Department: string | null;
    Organization: string | null;
    SalesProvince: string | null;
    ProjectStage: string | null;
    Source:string | null;
    ContractReviewPageId:string | null;
    SelectContractReviewId:string | null;
    SelectQuatationId:string | null;
    OpportunityId: string | null;
    OpportunityNumber: string | null;
    OpportunityName: string | null;
    Reasons: string | null;
    TenderId: string | null;
    EstimatedBidTime: string | null;
  };
  msg: 'ok' | string;
  detail:
    | {
        Level1: string | null;
        Level2: string | null;
        Level3: string | null;
        ProductName: string | null;
        Brand: string | null;
        Qty: number | null;
        SupplierName: string | null;
        BiddingMode: string | null;
        ProductModel: string | null;
        ProductType: string | null;
        Unit: string | null;
        InquiryPrice: string | null;
        Origin: string | null;
        Remarks: string | null;
        //ValidPerformance:boolean;
        InquiryPaymentTerm: string | null;
        IncludeService: string | null;
        ContactInfo: string | null;
        SupplierCode: string | null;
        LifeStage: string | null;
        TrafficSources: string | null;
        Instructions: string | null;
        Bidding: string | null;
        UnitPrice: number | null;
        TotalUnitPrice: number | null;
        PaymentClause: string | null;
        GuaranteePeriod: string | null;
        TaxRate: string | null;
        ImportantGrade: string | null;
        BusinessUnit: string | null;
        SupplierApprovalOpinion: string | null;
        ComplianceApprovalOpinion: string | null;
        RegionalManager: string | null;
        ApprovalOpinion: string | null;
        ApprovalNotes: string | null;
        ApprovalRemarks: string | null;
        SupplierSignatory_ApprovalRemark: string | null;
        SupplierSignatory_ApprovalNotes: string | null;
        ComplianceDepartment_ApprovalRemark: string | null;
        ComplianceDepartment_ApprovalNotes: string | null;
        ProvincialManagerApprover_ApprovalRe: string | null;
        ProvincialManagerApprover_ApprovalNotes: string | null;
      }[]
    | null;
  bidPackage:
    | {
        BidSectionName: string | null;
        PackageName: string | null;
        PackageId: string | null;
        TenderProducerName: string | null;
        EstimatedBidTime: string | null;
        BidAlready: string | null;
        QuatationName: string | null;
        ContractName: string | null;
        ContractChangeName: string | null;
        MainProductGroupNew: string | null;
        ContractReviewName: string | null;
        ContractScheduleDate: string | null;
      }[]
    | null;
  prop: {
    Level3: PickList[];
    ProductType:PickList[];
    Level1: PickList[];
    Level2: PickList[];
    TaxRate: PickList[];
    ImportantGrade: PickList[];
    BusinessUnit?: PickList[];
    SupplierApprovalOpinion?: PickList[];
    ComplianceApprovalOpinion?: PickList[];
    RegionalManager?: PickList[];
  };
  role: Role | null;
}

interface BidPackage {
  BidSectionName: string | null;
  PackageName: string | null;
  PackageId: string | null;
  TenderProducerName: string | null;
  EstimatedBidTime: string | null;
  BidAlready: string | null;
  QuatationName: string | null;
  ContractName: string | null;
  ContractReviewId: string | null;
  ContractChangeName: string | null;
  ContractReviewName: string | null;
  ContractScheduleDate: string | null;
  QuatationId: string | null;
  ContractId: string | null;
  ContractChangeId: string | null;
}

export type Auth = 'read' | 'edit';

interface AllData {
  opp: {
    Id: string;
    Name: string;
    opportunityNumber__c?: string;
    province__c: string | null;
  };
  os: {
    Owner: string | null;
    Id: string | null;
    Name: string | null;
    OwnerId: string | null;
    ApplicationTime: string | null;
    EstimatedBidTime: string | null;
    Department: string | null;
    Organization: string | null;
    SalesProvince: string | null;
    ProjectStage: string | null;
    Source:string | null;
    OpportunityId: string | null;
    OpportunityNumber: string | null;
    OpportunityName: string | null;
    Reasons: string | null;
    TenderId: string | null;
    TenderName: string | null;
    PackageCollectionId: string | null;
    ApprovalStatus: string | null;
    NegotiatedBiddingProject: string | null;
    attachments: { Id: string; Name: string }[];
    ContractReviewPageId: string | null;
    SelectContractReviewId: string | null;
    SelectQuatationId:string | null;
  };
  bidSectionList: {
    Id: string | null;
    Name: string | null;
    EstimatedBidTime: string | null;
    AllBidPackages: BidPackage[];
    SelectedBidPackages: BidPackage[];
    SelectedContractReview: string[] | null;
    MainProductGroupNew: string | null;
    osdList: {
      Level1:string | null;
      Level2: string | null;
      Level3: string | null;
      ProductName: string | null;
      Brand: string | null;
      Qty: number | null;
      SupplierName: string | null;
      BiddingMode: string | null;
      ProductModel: string | null;
      ProductType: string | null;
      Unit: string | null;
      InquiryPrice: string | null;
      Origin: string | null;
      Remarks: string | null;
      //ValidPerformance:boolean;
      InquiryPaymentTerm: string | null;
      IncludeService: string | null;
      ContactInfo: string | null;
      SupplierCode: string | null;
      LifeStage: string | null;
      TrafficSources: string | null;
      Instructions: string | null;
      Bidding: string | null;
      UnitPrice: number | null;
      TotalUnitPrice: number | null;
      PaymentClause: string | null;
      GuaranteePeriod: string | null;
      TaxRate: string | null;
      ImportantGrade: string | null;
      BusinessUnit: string | null;
      SupplierApprovalOpinion: string | null;
      ComplianceApprovalOpinion: string | null;
      RegionalManager: string | null;
      ApprovalOpinion: string | null;
      ComplianceApprovalOpinionSOSP: string | null;
      SupplierApprovalOpinionSOSP: string | null;
      BusinessUnitSOSP: string | null;
      Control: string | null;
      ApprovalNotes: string | null;
      ApprovalRemarks: string | null;
      SupplierSignatory_ApprovalRemark: string | null;
      SupplierSignatory_ApprovalNotes: string | null;
      ComplianceDepartment_ApprovalRemark: string | null;
      ComplianceDepartment_ApprovalNotes: string | null;
      ProvincialManagerApprover_ApprovalRe: string | null;
      ProvincialManagerApprover_ApprovalNotes: string | null;
      MarketPriceWithTax: number | null;
      WithoutMarketPriceReason: string | null;
      MainProductGroupNew: string | null;
      attachments: { Id: string; Name: string }[];
    }[];
  }[];
  prop: {
    Level3: PickList[];
    ProductType:PickList[];
    Level1?: PickList[];
    Level2?: PickList[];
    TaxRate: PickList[];
    IncludeService: PickList[];
    Unit: PickList[];
    ImportantGrade: PickList[];
    BusinessUnit?: PickList[];
    SupplierApprovalOpinion?: PickList[];
    ComplianceApprovalOpinion?: PickList[];
    RegionalManager?: PickList[];
    Control: PickList[];
    GuaranteePeriod: PickList[];
    ApprovalRemarks: PickList[];
    SupplierSignatory_ApprovalRemark: PickList[];
    ComplianceDepartment_ApprovalRemark: PickList[];
    ProvincialManagerApprover_ApprovalRe: PickList[];
    TrafficSources: PickList[];
    NegotiatedBiddingProject: PickList[];
    ContractReview: (PickList & {
      MainProductGroup: string | null;
      id: string;
    })[];
    ApplicationLevel: PickList[];
  };
  currentRole: Role | null;
  type: Auth | null;
  extraType: Auth | null;
  transType: Auth | null;
  attachmentType: Auth | null;
  transFrExtraType: Auth | null;
  applicationLevel: ApplicationLevel;
}

export type ApplicationLevel =
  | '非常用外购决策'
  | null;

export const initBidInfo = (bidId: string) =>
  instance<Response>('initBidInfo', [bidId]);

export const searchPackage = (bidId: string, name: string) =>
  instance<NonNullable<Response['bidPackage']>>('searchPackage', [bidId, name]);

export const saveOutSourcing = (
  bidId: string,
  data: Pick<Response, 'data' | 'detail' | 'bidPackage'>
) => instance<Response>('saveOutSourcing', [bidId, JSON.stringify(data)]);

export const saveAndSyncOutSourcing = (
  bidId: string,
  data: Pick<Response, 'data' | 'detail' | 'bidPackage'>
) =>
  instance<Response>('saveAndSyncOutSourcing', [bidId, JSON.stringify(data)]);

export const initOutSouringInfo = (recordId: string) =>
  instance<Response>('initOutSouringInfo', [recordId]);

export const saveApproval = (
  recordId: string,
  jsonStr: Pick<AllData, 'opp' | 'os' | 'bidSectionList'>
) => instance<Response>('saveApproval', [recordId, JSON.stringify(jsonStr)]);

export const searchSection = (oppId: string, partName: string | null) =>
  instance<AllData>('searchSection', [oppId, partName]);

export const upsertOutsourcingApplicationDetail = (
  jsonStr: Pick<AllData, 'opp' | 'os' | 'bidSectionList'>,
  isSubmit: boolean
) =>
  instance<{ IsSuccess: boolean; Message: string; data: [string] }>(
    'upsertOutsourcingApplicationDetail',
    [JSON.stringify(jsonStr), isSubmit]
  );

export const buildAllData = (recordId: string) =>
  instance<AllData>('buildAllData', [recordId]);

interface BaseQRObj {
  userIdLong: string | null;
  userId: string | null;
  urladdress: string | null;
  token: string | null;
  email: string | null;
}
export const getBaseQRObj = (recordId: string) =>
  instance<BaseQRObj>('getBaseQRObj', [recordId]);

export const getApprovalRedirectUrl = (recordId: string) =>
  instance<{ IsSuccess: boolean; Message: string; data: [string] }>(
    'getApprovalRedirectUrl',
    [recordId]
  );

export const searchFromUser = (keyword: string) =>
  instance<{ Name: string; Id: string }[]>('searchFromUser', [keyword]);

export const saveExtraApprover = (
  recordId: string,
  currentRole: Role,
  userId: string
) => instance<Response>('saveExtraApprover', [recordId, currentRole, userId]);

export const saveTransApprover = (
  recordId: string,
  currentRole: Role,
  userId: string
) => instance<null>('saveTransApprover', [recordId, currentRole, userId]);
