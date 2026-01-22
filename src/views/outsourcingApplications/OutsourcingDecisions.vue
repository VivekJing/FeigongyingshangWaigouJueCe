<template>
  <main class="p-3">
    <h1 class="text-center text-[#181818] leading-6 text-xl">
      {{ type === Type.New ? '创建' : type === Type.Edit ? '编辑' : '审批' }}
      {{
        type === Type.Approval
          ? (prop.ApplicationLevel.find((v) => v.value === title)?.label ??
            title)
          : '非推荐供应商选用决策'
      }}
    </h1>
    <el-form :model="form" ref="formRef" label-width="auto" label-position="left" scroll-to-error inline-message>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="基本信息" name="basic">
          <template #title>
            <header class="text-black font-bold text-xl">基本信息</header>
          </template>
          <el-row class="px-4">
            <el-col :span="12">
              <el-form-item label="来源">{{
                form.os.Source
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请单号">{{ form.os.Name }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请人">{{ form.os.Owner }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间">{{
                form.os.ApplicationTime
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门名称">{{
                form.os.Department
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="销售组织">{{
                form.os.Organization
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="销售省区">{{
                form.os.SalesProvince
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目所处阶段">{{
                form.os.ProjectStage
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目实施所在省区">{{
                form.opp.province__c
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务机会号">
                <el-link type="primary" target="_blank" :href="toDetail(form.opp.Id)">
                  {{ form.opp.opportunityNumber__c }}
                </el-link>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务机名称">{{
                form.opp.Name
                }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否议标项目" prop="os.NegotiatedBiddingProject" :rules="{
                required: true,
                message: '请选择',
                trigger: 'change',
              }">
                <div v-if="isApproval">
                  {{
                    prop.NegotiatedBiddingProject.find(
                      (v) => v.value === form.os.NegotiatedBiddingProject
                    )?.label ?? form.os.NegotiatedBiddingProject
                  }}
                </div>
                <el-select v-else v-model="form.os.NegotiatedBiddingProject" class="!w-[100px]" :disabled="!form.bidSectionList.every(
                  (v) =>
                    !v.Id &&
                    v.SelectedBidPackages.length === 0 &&
                    v.SelectedContractReview.length === 0
                ) || form.bidSectionList.length > 1
                  ">
                  <el-option v-for="item in prop.NegotiatedBiddingProject" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="isApproval" :span="12">
              <el-form-item>
                <el-button type="primary" @click="
                  uploadRecordId = form.os.Id!,
                  fileList = form.os.attachments,
                  uploadDialogVisible = true">
                  上传/查看附件
                </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="申请原因" prop="os.Reasons" :rules="[
                { required: true, message: '请输入', trigger: 'blur' },
                { max: 255, message: '最多输入255个字符', trigger: 'blur' },
              ]">
                <div v-if="isApproval" class="whitespace-pre-line">
                  {{ form.os.Reasons }}
                </div>
                <el-input v-else v-model="form.os.Reasons" type="textarea" maxlength="255"
                  :autosize="{ minRows: 5, maxRows: 5 }" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="投标信息" name="bid">
          <template #title>
            <header class="text-black font-bold text-xl">投标信息</header>
          </template>
          <div class="px-4">
            <div class="text-right mb-2">
              <!-- <template v-if="isApproval && !approvalUrl && role">
                <el-button type="primary" :disabled="auth === 'read'"
                  @click="handleApproval(Approval['同意'])">批量同意</el-button>
                <el-button type="primary" :disabled="auth === 'read'"
                  @click="handleApproval(Approval['有条件同意'])">批量有条件同意</el-button>
                <el-button type="primary" :disabled="auth === 'read'"
                  @click="handleApproval(Approval['拒绝'])">批量不同意</el-button>
                <el-button type="primary" :disabled="auth === 'read'"
                  @click="handleApprovalText">批量同步审批补充说明内容</el-button>
              </template> -->
              <!-- <template v-if="!isApproval">
                <el-button type="danger" @click="deleteBidPackage">删除标段</el-button>
                <el-button type="primary" :disabled="form.os.NegotiatedBiddingProject === '是' &&
                  form.bidSectionList.length >= 1
                  " @click="newBidPackage">新增标段</el-button>
              </template>-->
            </div>
            <el-table :data="form.bidSectionList" ref="bidPackageTable" class="bid-table" empty-text="暂无数据" border
              row-key="frontKey" header-cell-class-name="!bg-[#f8f8f9]" cell-class-name="whitespace-pre-line"
              scrollbar-always-on default-expand-all>
              <el-table-column v-if="!approvalUrl" type="expand">
                <template #default="{
                  row: mRow,
                  $index,
                }: {
                  row: Data['bidSectionList'][number],
                  $index: number
                }">
                  <div class="pl-[50px] mb-6">
                    <div class="mb-1 text-right">
                      <template v-if="!isApproval || !isApproval">
                        <el-button type="primary" @click="((dialogVisible = true), (currentRow = mRow))">导入</el-button>
                        <el-button type="primary" @click="newDetail(mRow.osdList)">新增</el-button>
                        <el-button type="primary" @click="copyLine(mRow.osdList)">复制</el-button>
                        <el-button type="primary" @click="deleteDetail(mRow)">删除</el-button>
                      </template>
                    </div>
                    <el-table :data="mRow.osdList" empty-text="暂无数据" border header-cell-class-name="!bg-[#f8f8f9]"
                      scrollbar-always-on>
                      <el-table-column width="50" align="center">
                        <template #header>
                          <el-checkbox v-model="mRow.tableCheckedAll" :indeterminate="mRow.osdList.some((v) => v.checked) &&
                            !mRow.osdList.every((v) => v.checked)
                            " @change="
                              mRow.osdList.forEach((v) => (v.checked = $event))
                              " />
                        </template>
                        <template #default="{ row }: { row: BidSectionList['osdList'][number] }">
                          <el-checkbox v-model="row.checked" @change="
                            mRow.tableCheckedAll = mRow.osdList.every(
                              (v) => v.checked
                            )
                            " />
                        </template>
                      </el-table-column>
                      <el-table-column label="序号" type="index" width="50" align="center" />
                      <!-- <template v-if="isApproval">
                        <el-table-column v-if="role" :label="`${role}审批意见`" align="center">
                          <template #header="{
                            column,
                          }: {
                            column: TableColumnCtx<BidSectionList['osdList'][number]>
                          }">
                            <span class="before:content-['*'] before:mr-0.5 before:text-red-500">
                              {{ column.label }}
                            </span>
                          </template>
                          <template #default="{
                            row,
                            $index: $indey,
                          }: {
                            row: BidSectionList['osdList'][number]
                            $index: number
                          }">
                            <el-form-item
                              :prop="`bidSectionList[${$index}].osdList[${$indey}][${approvalOpinion[role].select}]`"
                              :rules="{
                                required: true,
                                message: '请选择',
                                trigger: 'change',
                              }">
                              <el-select v-model="row[approvalOpinion[role].select]" clearable
                                :disabled="auth === 'read'">
                                <el-option v-for="item in prop[
                                  approvalOpinion[role].select
                                ]" :key="item.value" :label="item.label" :value="item.value" />
                              </el-select>
                            </el-form-item>
                          </template>
                        </el-table-column>
                        <el-table-column v-if="role" label="意见补充说明" align="center" width="150">
                          <template #default="{
                            row,
                            $index: $indey,
                          }: {
                            row: BidSectionList['osdList'][number]
                            $index: number
                          }">
                            <el-form-item
                              :prop="`bidSectionList[${$index}].osdList[${$indey}][${[approvalOpinion[role].input]}]`"
                              :rules="[
                                {
                                  required:
                                    row[approvalOpinion[role].select] ===
                                    Approval['拒绝'] ||
                                    row[approvalOpinion[role].select] ===
                                    Approval['有条件同意'],
                                  message: '请输入',
                                  trigger: 'blur',
                                },
                                {
                                  max: 500,
                                  message: '最多输入500个字符',
                                  trigger: 'blur',
                                },
                              ]">
                              <el-input v-model="row[approvalOpinion[role].input]" type="textarea" maxlength="500"
                                autosize show-word-limit :disabled="auth === 'read'" />
                            </el-form-item>
                          </template>
                        </el-table-column>
                      </template> -->
                      <el-table-column prop="Level3" label="场景分类(三级)" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Level3`" :rules="{
                            required: true,
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{ showLabel(row.Level3, prop.Level3) }}
                            </div>
                            <el-select v-else v-model="row.Level3" clearable>
                              <el-option v-for="item in prop.Level3.filter(
                                (v) => !disabledLevel3.includes(v.value)
                              )" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <!--<template v-if="isApproval">
                        <el-table-column label="市场单价(含税)" align="center">
                          <template #default="{ row }: { row: BidSectionList['osdList'][number] }">
                            <div v-if="
                              (role !== Role['供应商'] &&
                                role !== Role['供应商加签人']) ||
                              auth === 'read'
                            ">
                              {{ priceFormat(row.MarketPriceWithTax) }}
                            </div>
                            <el-input-number v-else v-model="row.MarketPriceWithTax" :controls="false" :precision="2"
                              class="!w-full" />
                          </template>
                        </el-table-column>
                        <el-table-column label="未维护市场价原因" align="center" width="115">
                          <template
                            #default="{ row, $index: $indey }: { row: BidSectionList['osdList'][number], $index: number }">
                            <el-form-item
                              :prop="`bidSectionList[${$index}].osdList[${$indey}].WithoutMarketPriceReason`" :rules="{
                                max: 500,
                                message: '最多输入500个字符',
                                trigger: 'blur',
                              }">
                              <div v-if="
                                (role !== Role['供应商'] &&
                                  role !== Role['供应商加签人']) ||
                                auth === 'read'
                              ">
                                {{ row.WithoutMarketPriceReason }}
                              </div>
                              <el-input v-else v-model="row.WithoutMarketPriceReason" type="textarea" maxlength="500"
                                show-word-limit />
                            </el-form-item>
                          </template>
                        </el-table-column>
                      </template>-->
                      <el-table-column prop="ProductName" label="名称" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].ProductName`" :rules="[
                            {
                              required: true,
                              message: '请输入',
                              trigger: 'blur',
                            },
                            {
                              max: 260,
                              message: '最多输入260个字符',
                              trigger: 'blur',
                            },
                          ]">
                            <div v-if="isApproval">{{ row.ProductName }}</div>
                            <el-input v-else v-model="row.ProductName" type="textarea" maxlength="260" show-word-limit
                              :autosize="{ minRows: 2 }" />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="BiddingMode" label="投标型号" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].BiddingMode`" :rules="[
                            {
                              required: true,
                              message: '请输入',
                              trigger: 'blur',
                            },
                            {
                              max: 260,
                              message: '最多输入260个字符',
                              trigger: 'blur',
                            },
                          ]">
                            <div v-if="isApproval">{{ row.BiddingMode }}</div>
                            <el-input v-else v-model="row.BiddingMode" type="textarea" maxlength="260" show-word-limit
                              :autosize="{ minRows: 2 }" />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="ProductModel" label="产品型号" align="center">
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].ProductModel`" :rules="{
                            max: 260,
                            message: '最多输入260个字符',
                            trigger: 'blur',
                          }">
                            <div v-if="isApproval">{{ row.ProductModel }}</div>
                            <el-input v-else v-model="row.ProductModel" type="textarea" maxlength="260" show-word-limit
                              :autosize="{ minRows: 2 }" />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <!-- <el-table-column prop="PriceModel" label="价格型号" align="center"
                        :formatter="totalUnitPriceFormatter" /> -->
                      <el-table-column prop="ProductType" label="产品类型" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template
                          #default="{ row, $index: $indey, }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].ProductType`" :rules="{
                            required: true,
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.ProductType,
                                  prop.ProductType
                                )
                              }}
                            </div>
                            <el-select v-else v-model="row.ProductType" @change="handleProductTypeChange(row)"
                              clearable>
                              <el-option v-for="item in prop.ProductType" :key="item.value" :label="item.label"
                                :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="Qty" label="数量" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Qty`" :rules="{
                            required: true,
                            message: '请输入',
                            trigger: 'blur',
                          }">
                            <div v-if="isApproval">{{ row.Qty }}</div>
                            <el-input-number v-else v-model="row.Qty" :controls="false" :precision="0" :min="0"
                              class="!w-full" />
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="Unit" label="单位" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template
                          #default="{ row, $index: $indey, }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Unit`" :rules="{
                            required: true,
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.Unit,
                                  prop.Unit
                                )
                              }}
                            </div>
                            <el-select v-else v-model="row.Unit" clearable>
                              <el-option v-for="item in prop.Unit" :key="item.value" :label="item.label"
                                :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="InquiryPrice" label="询价单价(元)" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].InquiryPrice`" :rules="{
                            required: true,
                            message: '请输入',
                            trigger: 'blur',
                          }">
                            <div v-if="isApproval">{{ row.InquiryPrice }}</div>
                            <el-input-number v-else v-model="row.InquiryPrice" :controls="false" :precision="2" :min="0"
                              class="!w-full" />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="Origin" label="产地" align="center">
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Origin`" :rules="{
                            max: 260,
                            message: '最多输入260个字符',
                            trigger: 'blur',
                          }">
                            <div v-if="isApproval">{{ row.Origin }}</div>
                            <el-input v-else v-model="row.Origin" type="textarea" maxlength="260" show-word-limit
                              :autosize="{ minRows: 2 }" />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="Remarks" label="备注" align="center">
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Remarks`" :rules="{
                            max: 260,
                            message: '最多输入260个字符',
                            trigger: 'blur',
                          }">
                            <div v-if="isApproval">{{ row.Remarks }}</div>
                            <el-input v-else v-model="row.Remarks" type="textarea" maxlength="260" show-word-limit
                              :autosize="{ minRows: 2 }" />
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <!--<el-table-column prop="ValidPerformance" label="是否有效业绩" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].ValidPerformance`">
                            <div v-if="isApproval">{{ row.ValidPerformance ? '是' : '否' }}</div>
                            <el-checkbox v-else v-model="row.ValidPerformance" />
                          </el-form-item>
                        </template>
                      </el-table-column>-->

                      <el-table-column prop="SupplierName" label="制造商" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].SupplierName`" :rules="[
                            {
                              required: true,
                              message: '请输入',
                              trigger: 'blur',
                            },
                            {
                              max: 260,
                              message: '最多输入260个字符',
                              trigger: 'blur',
                            },
                          ]">
                            <div v-if="isApproval">{{ row.SupplierName }}</div>
                            <el-input v-else v-model="row.SupplierName" type="textarea" maxlength="260" show-word-limit
                              :autosize="{ minRows: 2 }" />
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column prop="TrafficSources" label="指定渠道(厂家)" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template
                          #default="{ row, $index: $indey }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].TrafficSources`" :rules="{
                            required: true,
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.TrafficSources,
                                  prop.TrafficSources
                                )
                              }}
                            </div>
                            <el-select v-else v-model="row.TrafficSources" clearable>
                              <el-option v-for="item in prop.TrafficSources" :key="item.value" :label="item.label"
                                :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="TaxRate" label="税率(%)" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                        </template>
                        <template
                          #default="{ row, $index: $indey, }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].TaxRate`" :rules="{
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.TaxRate,
                                  prop.TaxRate
                                )
                              }}
                            </div>

                            <el-select v-else v-model="row.TaxRate">
                              <el-option v-for="item in prop.TaxRate" :key="item.value" :label="item.label"
                                :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="InquiryPaymentTerm" label="询价账期(天)" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].InquiryPaymentTerm`"
                            :rules="{
                              required: true,
                              message: '请输入',
                              trigger: 'blur',
                            }">
                            <div v-if="isApproval">
                              {{ row.InquiryPaymentTerm }}
                            </div>
                            <el-input-number v-else v-model="row.InquiryPaymentTerm" :controls="false" :min="0"
                              class="!w-full" />
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="GuaranteePeriod" label="质保期(年)" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].GuaranteePeriod`" :rules="{
                            required: true,
                            message: '请输入',
                            trigger: 'blur',
                          }">
                            <div v-if="isApproval">
                              {{ row.GuaranteePeriod }}
                            </div>
                            <el-input-number v-else v-model="row.GuaranteePeriod" :controls="false" :min="0"
                              class="!w-full" />
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="IncludeService" label="是否含服务" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                        </template>
                        <template
                          #default="{ row, $index: $indey, }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].IncludeService`" :rules="{
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.IncludeService,
                                  prop.IncludeService
                                )
                              }}
                            </div>
                            <el-select v-else v-model="row.IncludeService" clearable>
                              <el-option v-for="item in prop.IncludeService" :key="item.value" :label="item.label"
                                :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>



                      <el-table-column prop="ContactInfo" label="联系人及联系方式" align="center">
                        <template #header="{
                          column,
                        }: {
                          column: TableColumnCtx<BidSectionList['osdList'][number]>
                        }">
                          <span class="before:content-['*'] before:mr-0.5 before:text-red-500">{{ column.label }}</span>
                        </template>
                        <template #default="{
                          row,
                          $index: $indey,
                        }: {
                          row: BidSectionList['osdList'][number]
                          $index: number
                        }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].ContactInfo`" :rules="[
                            {
                              required: true,
                              message: '请输入',
                              trigger: 'blur',
                            },
                            {
                              max: 500,
                              message: '最多输入500个字符',
                              trigger: 'blur',
                            },
                          ]">
                            <div v-if="isApproval">{{ row.ContactInfo }}</div>
                            <el-input v-else v-model="row.ContactInfo" type="textarea" maxlength="500"
                              :autosize="{ minRows: 2 }" show-word-limit />
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="Level1" label="外购所属品类(一级)" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                        </template>
                        <template
                          #default="{ row, $index: $indey, }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Level1`" :rules="{
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.Level1,
                                  prop.Level1
                                )
                              }}
                            </div>
                            <el-select v-else v-model="row.Level1" filterable clearable @change="row.Level2 = ''">
                              <el-option v-for="item in prop.Level1" :key="item.value" :label="item.label"
                                :value="item.value" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column prop="Level2" label="外购所属品类(二级)" align="center">
                        <template #header="{ column }: { column: TableColumnCtx<BidSectionList['osdList'][number]> }">
                        </template>
                        <template
                          #default="{ row, $index: $indey, }: { row: BidSectionList['osdList'][number], $index: number }">
                          <el-form-item :prop="`bidSectionList[${$index}].osdList[${$indey}].Level2`" :rules="{
                            message: '请选择',
                            trigger: 'change',
                          }">
                            <div v-if="isApproval">
                              {{
                                showLabel(
                                  row.Level2,
                                  prop.Level2
                                )
                              }}
                            </div>
                            <el-select v-else v-model="row.Level2" filterable clearable :disabled="!row.Level1">
                              <el-option v-for="item in getLevel2Options(row.Level1)" :key="item" :label="item"
                                :value="item" />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>

                      <el-table-column label="附件" align="center" width="120">
                        <template #default="{ row }: { row: BidSectionList['osdList'][number] }">
                          <el-button type="primary" :disabled="!row.Id" @click="
                          ((uploadRecordId = row.Id!),
                            (fileList = row.attachments),
                            (uploadDialogVisible = true))
                            ">上传/查看附件</el-button>
                        </template>
                      </el-table-column>

                    </el-table>
                  </div>
                </template>
              </el-table-column>
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column type="index" label="标段" width="50" align="center"
                :index="(index: number) => `标段${index + 1}`" />
              <el-table-column prop="Name" label="标段名称" align="center">
                <template #header="{ column }: { column: TableColumnCtx<BidSectionList> }">
                  <span :class="form.os.NegotiatedBiddingProject !== '是'
                    ? `before:content-['*'] before:mr-0.5 before:text-red-500`
                    : ''
                    ">
                    {{ column.label }}
                  </span>
                </template>
                <template #default="{ row, $index }: { row: Data['bidSectionList'][number]; $index: number }">
                  <el-form-item :prop="`bidSectionList[${$index}].Id`" :rules="{
                    required: form.os.NegotiatedBiddingProject !== '是',
                    message: '请选择',
                    trigger: 'change',
                  }">
                    <el-link v-if="isApproval" type="primary" target="_blank" :href="toDetail(row.Id!)">
                      {{ row.Name }}
                    </el-link>
                    <el-select v-else v-model="row.Id" filterable placeholder="选择标段" clearable
                      :disabled="form.os.NegotiatedBiddingProject === '是'" @change="changePackage(row, $event)">
                      <el-option v-for="item in allBidSectionList" :key="item.Id" :label="item.Name" :value="item.Id" />
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="标包" align="center">
                <template #header="{ column }: { column: TableColumnCtx<BidSectionList> }">
                  <span :class="form.os.NegotiatedBiddingProject !== '是'
                    ? `before:content-['*'] before:mr-0.5 before:text-red-500`
                    : ''
                    ">
                    {{ column.label }}
                  </span>
                </template>
                <template #default="{ row, $index }: { row: Data['bidSectionList'][number]; $index: number }">
                  <el-form-item :prop="`bidSectionList[${$index}].SelectedBidPackages`" :rules="[{
                    required: form.os.NegotiatedBiddingProject !== '是',
                    message: '请选择',
                    trigger: 'change',
                  }, {
                    validator: (rule: any, value: any[], callback: any) => {
                      if (value && value.length > 1) {
                        callback(new Error('只能选择一个标包'));
                      } else {
                        callback();
                      }
                    },
                    trigger: 'change'
                  }]">
                    <template v-if="isApproval">
                      <div class="w-full flex flex-col items-center">
                        <div v-for="link in row.SelectedBidPackages" :key="link.PackageId!">
                          <el-link type="primary" target="_blank" :href="toDetail(link.PackageId!)">
                            {{ link.PackageName }}
                          </el-link>
                        </div>
                      </div>
                    </template>
                    <el-select v-else v-model="row.SelectedBidPackages" filterable placeholder="选择标包"
                      value-key="PackageId" multiple :disabled="form.os.NegotiatedBiddingProject === '是'"
                      @change="handleBidPackageChange(row)">
                      <el-option v-for="item in row.AllBidPackages" :key="item.PackageId" :label="item.PackageName"
                        :value="item" />
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="TenderProducerName" label="标书制作人" align="center" :formatter="packageFormatter" />
              <el-table-column prop="EstimatedBidTime" label="开标时间" align="center" :formatter="packageFormatter" />
              <el-table-column prop="BidAlready" label="标前/标后" align="center" :formatter="packageFormatter" />
              <el-table-column label="报价管理号" align="center">
                <template #header="{ column }: { column: TableColumnCtx<BidSectionList> }">
                  <span :class="form.os.NegotiatedBiddingProject !== '是'
                    ? `before:content-['*'] before:mr-0.5 before:text-red-500`
                    : ''
                    ">
                    {{ column.label }}
                  </span>
                </template>
                <template #default="{ row, $index }: { row: Data['bidSectionList'][number]; $index: number }">
                  <el-form-item :prop="`bidSectionList[${$index}].SelectedBidPackages`" :rules="{
                    validator: (_r: any, _v: any, callback: any) =>
                      row.SelectedBidPackages.filter((v) => v.QuatationId).length > 0 || form.os.NegotiatedBiddingProject === '是'
                        ? callback()
                        : callback(new Error('请选择报价管理号')),
                    trigger: 'change',
                  }">
                    <div class="w-full">
                      <div v-for="link in row.SelectedBidPackages" :key="link.PackageId!">
                        <el-link type="primary" target="_blank" :href="toDetail(link.QuatationId!)">
                          {{ link.QuatationName }}
                        </el-link>
                      </div>
                    </div>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="合同评审号" align="center">
                <template #header="{ column }: { column: TableColumnCtx<BidSectionList> }">
                  <span :class="form.os.NegotiatedBiddingProject === '是'
                    ? `before:content-['*'] before:mr-0.5 before:text-red-500`
                    : ''
                    ">
                    {{ column.label }}
                  </span>
                </template>
                <template #default="{ row, $index }: { row: BidSectionList, $index: number }">
                  <el-form-item :prop="`bidSectionList[${$index}].SelectedContractReview`" :rules="[{
                    required: form.os.NegotiatedBiddingProject === '是',
                    message: '请选择',
                    trigger: 'change',
                  }, {
                    validator: (rule: any, value: any, callback: any) => {
                      if (value && value.length > 1) {
                        callback(new Error('只能选择一个合同评审号'));
                      } else {
                        callback();
                      }
                    },
                    trigger: 'change'
                  }]">
                    <template v-if="form.os.NegotiatedBiddingProject !== '是'">
                      <div v-for="link in row.SelectedBidPackages" :key="link.PackageId!">
                        <el-link type="primary" target="_blank" :href="toDetail(link.ContractReviewId!)">
                          {{ link.ContractReviewName }}
                        </el-link>
                      </div>
                    </template>
                    <template v-else-if="isApproval">
                      <div v-for="link in row.SelectedContractReview" :key="link" class="w-full">
                        <el-link type="primary" target="_blank"
                          :href="toDetail(prop.ContractReview.find(v => v.value === link)?.id!)">
                          {{ link }}
                        </el-link>
                      </div>
                    </template>
                    <el-select v-else v-model="row.SelectedContractReview" filterable placeholder="选择合同评审" multiple
                      @change="handleContractReviewChange(row)">
                      <el-option v-for="item in prop.ContractReview" :key="item.value" :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="合同号" align="center">
                <template #default="{ row }: { row: BidSectionList }">
                  <div v-for="link in row.SelectedBidPackages" :key="link.PackageId!">
                    <el-link type="primary" target="_blank" :href="toDetail(link.ContractId!)">
                      {{ link.ContractName }}
                    </el-link>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="合同变更单号" align="center">
                <template #default="{ row }: { row: BidSectionList }">
                  <div v-for="link in row.SelectedBidPackages" :key="link.PackageId!">
                    <el-link type="primary" target="_blank" :href="toDetail(link.ContractChangeId!)">
                      {{ link.ContractChangeName }}
                    </el-link>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="MainProductGroupNew" label="主责事业部" align="center">
                <template #default="{ row }: { row: BidSectionList }">
                  <div v-if="form.os.NegotiatedBiddingProject !== '是'">
                    {{ row.MainProductGroupNew }}
                  </div>
                  <template v-else>
                    <div v-for="link in [
                      ...new Set(
                        row.SelectedContractReview.map(
                          (link) =>
                            prop.ContractReview.find((v) => v.value === link)
                              ?.MainProductGroup
                        ).filter(Boolean)
                      ),
                    ]" :key="link!">
                      <div>{{ link }}</div>
                    </div>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- <template v-if="approvalUrl">
        <iframe :src="approvalUrl" class="w-full h-96" />
      </template> -->

      <div class="mt-5 text-center">
        <el-button type="primary" @click="back">关闭</el-button>
        <!-- <template v-if="
          form.os.ApprovalStatus === '审批中' && title === '非常用外购决策'
        ">
           <template v-if="isApproval && role && !role.includes('加签人')">
            <el-button type="primary" :disabled="extraType === 'read'"
              @click="apostille(apostilleType['加签'])">加签</el-button>
          </template> 
          <template v-if="role && !role.includes('加签人')">
            <el-button type="primary" :disabled="transType === 'read'"
              @click="apostille(apostilleType['转办'])">转办</el-button>
          </template>
          <template v-if="role && role.includes('加签人')">
            <el-button type="primary" :disabled="transFrExtraType === 'read'"
              @click="apostille(apostilleType['加签'])">加签人转办</el-button>
          </template>
        </template> -->
        <template v-if="!isApproval">
          <el-button type="primary" @click="submit(IsApproval['暂存'])">暂存</el-button>
          <el-button type="primary" @click="submit(IsApproval['提交'])">提交</el-button>
        </template>
      </div>
    </el-form>

    <ImportDialog v-model="dialogVisible" :templateData="templateData" @file-change="fileChange" />

    <UploadDialog v-model="uploadDialogVisible" :file-list="fileList" :id="uploadRecordId" :auth="attachmentType" />
  </main>
</template>

<script setup lang="tsx">
import {
  genFileId,
  // ElForm,
  // ElFormItem,
  type FormInstance,
  type TableColumnCtx,
  type TableInstance,
} from 'element-plus';
import {
  searchSection,
  type PickList,
  Role,
  // saveOutSourcing,
  // saveAndSyncOutSourcing,
  upsertOutsourcingApplicationDetail,
  buildAllData,
  // initOutSouringInfo,
  saveApproval,
  //getApprovalRedirectUrl,
  searchFromUser,
  saveExtraApprover,
  type ApplicationLevel,
  saveTransApprover,
  type Auth,
} from '@/request/outsourcingApplication';
import { useNavigate } from '@/hooks/useNavigate';
import useFormat from '@/hooks/useFormat';
import config from '@/config/config';
import { toDetail } from '@/utils';
import ImportDialog from '@/components/ImportDialog/ImportDialog.vue';
import UploadDialog from '@/components/uploadDialog/UploadDialog.vue';
import { categoryMap } from '@/config/config';
import { taxRateMap } from '@/config/config';
defineProps(['prop', 'isApproval'])

enum Type {
  Edit = 'edit',
  Approval = 'approval',
  New = 'new',
}

const { priceFormat } = useFormat();
const { navigateBack, showToast } = useNavigate();
const route = useRoute();
const router = useRouter();
const bidSectionId = route.query.id as string;
const recordId = route.query.recordId as string;
const type = route.query.type as Type;
const contractReviewPageId = route.query.contractReviewId as string;
console.log(contractReviewPageId);

const isApproval = type === Type.Approval;

const formRef = useTemplateRef<FormInstance>('formRef');
const bidPackageTable = useTemplateRef<TableInstance>('bidPackageTable');

const activeNames = ref(['basic', 'bid']);
const title = ref<ApplicationLevel | null>(null);

interface BidPackages {
  BidSectionName: string | null;
  PackageName: string | null;
  PackageId: string | null;
  TenderProducerName: string | null;
  EstimatedBidTime: string | null;
  BidAlready: string | null;
  QuatationName: string | null;
  ContractName: string | null;
  ContractChangeName: string | null;
  ContractReviewName: string | null;
  ContractScheduleDate: string | null;
  QuatationId: string | null;
  ContractReviewId: string | null;
  ContractId: string | null;
  ContractChangeId: string | null;
}

interface BidSectionList {
  frontKey: string;
  Id: string | null;
  Name: string | null;
  EstimatedBidTime: string | null;
  MainProductGroupNew: string | null;
  tableCheckedAll: boolean;
  bidSectionList: Pick<
    BidSectionList,
    | 'SelectedBidPackages'
    | 'Id'
    | 'Name'
    | 'EstimatedBidTime'
    | 'AllBidPackages'
    | 'MainProductGroupNew'
  >[];
  SelectedContractReview: string[];
  SelectedBidPackages: BidPackages[];
  AllBidPackages: BidPackages[];
  osdList: {
    checked: boolean;
    frontKey: string;
    Id: string | null;
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
    //ValidPerformance: boolean;
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
    attachments: { Id: string; Name: string }[];
    MarketPriceWithTax: number | null;
    WithoutMarketPriceReason: string | null;
    MainProductGroupNew: string | null;
  }[];
}

interface Data {
  opp: {
    Id: string;
    Name: string;
    opportunityNumber__c: string;
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
    Source: string | null;
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
    SelectQuatationId: string | null;

  };
  bidSectionList: BidSectionList[];
}
const form = ref<Data>({
  opp: {
    Id: '',
    Name: '',
    opportunityNumber__c: '',
    province__c: null,
  },
  os: {
    Owner: null,
    Id: null,
    Name: null,
    OwnerId: null,
    ApplicationTime: null,
    EstimatedBidTime: null,
    Department: null,
    Organization: null,
    SalesProvince: null,
    ProjectStage: null,
    Source: null,
    OpportunityId: null,
    OpportunityNumber: null,
    OpportunityName: null,
    Reasons: null,
    TenderId: null,
    TenderName: null,
    PackageCollectionId: null,
    ApprovalStatus: null,
    NegotiatedBiddingProject: null,
    attachments: [],
    ContractReviewPageId: contractReviewPageId || null,
    SelectContractReviewId: null,
    SelectQuatationId: null,
  },
  bidSectionList: [],
});
const allBidSectionList = shallowRef<BidSectionList['bidSectionList']>([]);
type Prop = {
  Level3: PickList[];
  Level1?: PickList[];
  Level2?: PickList[];
  TaxRate: PickList[];
  ImportantGrade: PickList[];
  BusinessUnit?: PickList[];
  SupplierApprovalOpinion?: PickList[];
  ComplianceApprovalOpinion?: PickList[];
  RegionalManager?: PickList[];
  Control?: PickList[];
  ProductType: PickList[];
  IncludeService: PickList[];
  Unit: PickList[];
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
const prop = shallowRef<Prop>({
  Level3: [],
  Level1: [],
  Level2: [],
  TaxRate: [],
  ImportantGrade: [],
  BusinessUnit: [],
  SupplierApprovalOpinion: [],
  ComplianceApprovalOpinion: [],
  RegionalManager: [],
  GuaranteePeriod: [],
  ProductType: [],
  IncludeService: [],
  Unit: [],
  ApprovalRemarks: [],
  SupplierSignatory_ApprovalRemark: [],
  ComplianceDepartment_ApprovalRemark: [],
  ProvincialManagerApprover_ApprovalRe: [],
  TrafficSources: [],
  NegotiatedBiddingProject: [],
  ContractReview: [],
  ApplicationLevel: [],
});
const disabledLevel3 = ['1'];
const role = ref<Role>();
const auth = ref<Auth | null>(null);
const extraType = ref<Auth | null>(null);
const transType = ref<Auth | null>(null);
const attachmentType = ref<Auth | null>(null);
const transFrExtraType = ref<Auth | null>(null);

const changePackage = (row: Data['bidSectionList'][number], Id: string) => {
  console.log(row, Id);
  const result = allBidSectionList.value.find((v) => v.Id === Id);
  console.log(result);
  row.SelectedBidPackages = [];
  row.AllBidPackages = result!.AllBidPackages;
  row.EstimatedBidTime = result!.EstimatedBidTime;
  row.MainProductGroupNew = result!.MainProductGroupNew;
};
const newBidPackage = () => {
  form.value.bidSectionList.push({
    frontKey: String(genFileId()),
    Id: null,
    Name: null,
    EstimatedBidTime: null,
    SelectedBidPackages: [],
    osdList: [],
    bidSectionList: [],
    AllBidPackages: [],
    tableCheckedAll: false,
    MainProductGroupNew: null,
    SelectedContractReview: [],
  });

  newDetail(
    form.value.bidSectionList[form.value.bidSectionList.length - 1].osdList
  );
};
const deleteBidPackage = async () => {
  const rows = bidPackageTable.value!.getSelectionRows() as BidSectionList[];
  if (!rows.length) return showToast('请勾选标段', 'error');
  await ElMessageBox.confirm('确认删除吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  });
  const Ids = rows.map((v: BidSectionList) => v.frontKey);
  form.value.bidSectionList = form.value.bidSectionList.filter(
    (v) => !Ids.includes(v.frontKey)
  );
};

const showLabel = (value: string | null, pickList: Prop[keyof Prop]) => {
  return pickList!.find((v) => v.value === value)?.label ?? value;
};

const packageFormatter = (
  r: Data['bidSectionList'][number],
  c: TableColumnCtx<Data['bidSectionList'][number]>
) => {
  return r.SelectedBidPackages[0]?.[c.property as keyof BidPackages];
  // return r.SelectedBidPackages.map(v => v[c.property as keyof BidPackages]).join('\n')
};

const newDetail = (osdList: BidSectionList['osdList']) => {
  osdList.push({
    frontKey: String(genFileId()),
    Id: null,
    Level1: null,
    Level2: null,
    Level3: null,
    ProductName: null,
    Brand: null,
    Qty: null,
    SupplierName: null,
    BiddingMode: null,
    ProductModel: null,
    ProductType: null,
    Unit: null,
    InquiryPrice: null,
    Origin: null,
    Remarks: null,
    //ValidPerformance: false,
    InquiryPaymentTerm: null,
    IncludeService: null,
    ContactInfo: null,
    SupplierCode: null,
    LifeStage: null,
    TrafficSources: null,
    Instructions: null,
    Bidding: '四方配套',
    UnitPrice: null,
    TotalUnitPrice: null,
    PaymentClause: null,
    GuaranteePeriod: null,
    TaxRate: null,
    ImportantGrade: null,
    BusinessUnit: null,
    SupplierApprovalOpinion: null,
    ComplianceApprovalOpinion: null,
    RegionalManager: null,
    ApprovalOpinion: null,
    checked: false,
    ComplianceApprovalOpinionSOSP: null,
    SupplierApprovalOpinionSOSP: null,
    BusinessUnitSOSP: null,
    Control: null,
    ApprovalNotes: null,
    ApprovalRemarks: null,
    SupplierSignatory_ApprovalRemark: null,
    SupplierSignatory_ApprovalNotes: null,
    ComplianceDepartment_ApprovalRemark: null,
    ComplianceDepartment_ApprovalNotes: null,
    ProvincialManagerApprover_ApprovalRe: null,
    ProvincialManagerApprover_ApprovalNotes: null,
    attachments: [],
    MarketPriceWithTax: null,
    WithoutMarketPriceReason: null,
    MainProductGroupNew: null,
  });
};

const copyLine = (osdList: BidSectionList['osdList']) => {
  const rows = osdList.filter((v) => v.checked);
  if (!rows.length) return showToast('请勾选行', 'error');
  osdList.push(
    ...rows.map((v: BidSectionList['osdList'][number]) => ({
      ...v,
      frontKey: String(genFileId()),
      Id: null,
      checked: false,
    }))
  );
};

const deleteDetail = async (row: BidSectionList) => {
  const rows = row.osdList.filter((v) => v.checked);
  if (!rows.length) return showToast('请勾选行', 'error');
  await ElMessageBox.confirm('确认删除吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  });

  row.osdList = row.osdList.filter((v) => !v.checked);
};

const totalUnitPriceFormatter = (row: BidSectionList['osdList'][number]) => {
  row.TotalUnitPrice =
    Math.round(Number(row.Qty) * Number(row.UnitPrice) * 100) / 100;

  const totalUnitPrice = row.TotalUnitPrice.toFixed(2).split('.');
  totalUnitPrice[0] = totalUnitPrice[0].replace(/\B(?=(\d{3})+$)/g, ',');

  return totalUnitPrice.join('.');
};

/**
 * 导入
 */
const dialogVisible = ref(false);
let currentRow: Data['bidSectionList'][number];
const templateData = [
  {
    url: './xlsx/decision_template.xlsx',
    templateName: '非推荐供应商选用决策导入模版',
  },
];
type ImportData = {

  '场景分类(三级)'?: string | number;
  名称?: string | number;
  投标型号?: string | number;
  产品型号: string | number;
  产品类型: string | number;
  数量?: number;
  '单位'?: string | number;
  '询价单价(元)'?: string | number;
  '产地'?: string | number;
  '备注'?: string | number;
  //'是否有效业绩'?: string | number;
  制造商?: string | number;
  '指定渠道(厂家)'?: string | number;

  '税率(%)'?: string | number;
  '询价账期(天)'?: string | number;
  '质保(年)'?: string | number;
  '是否含服务'?: string | number;
  '联系人及联系方式'?: string | number;
  '外购所属品类(一级)'?: string | number;
  '外购所属品类(二级)'?: string | number;

};
// 导入成功回调
const fileChange = async (ws: ImportData[]) => {
  console.log(ws);
  const targetList: BidSectionList['osdList'] = ws.map((v) => ({
    frontKey: String(genFileId()),
    Id: null,
    checked: false,
    Level3:
      '场景分类(三级)' in v
        ? (prop.value.Level3.find(
          (ele) => ele.label === String(v['场景分类(三级)'])
        )?.value ?? null)
        : null,
    ProductName: '名称' in v ? String(v['名称']) : null,
    BiddingMode: '投标型号' in v ? String(v['投标型号']) : null,
    ProductModel: '产品型号' in v ? String(v['产品型号']) : null,
    ProductType: '产品类型' in v ? String(v['产品类型']) : null,
    Qty: v['数量'] ?? null,
    Unit: '单位' in v ? String(v['单位']) : null,
    InquiryPrice: '询价单价(元)' in v ? String(v['询价单价(元)']) : null,
    Origin: '产地' in v ? String(v['产地']) : null,
    Remarks: '备注' in v ? String(v['备注']) : null,
    //ValidPerformance: v['是否有效业绩'] === '是' || v['是否有效业绩'] === 1,
    SupplierName: '制造商' in v ? String(v['制造商']) : null,
    TrafficSources:
      '指定渠道(厂家)' in v
        ? (prop.value.TrafficSources.find(
          (ele) => ele.label === String(v['指定渠道(厂家)'])
        )?.value ?? null)
        : null,
    TaxRate: '税率(%)' in v ? String(v['税率(%)']) : null,

    InquiryPaymentTerm: '询价账期(天)' in v ? String(v['询价账期(天)']) : null,
    GuaranteePeriod: '质保(年)' in v ? String(v['质保(年)']) : null,
    IncludeService: '是否含服务' in v ? String(v['是否含服务']) : null,
    ContactInfo: '联系人及联系方式' in v ? String(v['联系人及联系方式']) : null,
    Level1: '外购所属品类(一级)' in v ? String(v['外购所属品类(一级)']) : null,
    Level2: '外购所属品类(二级)' in v ? String(v['外购所属品类(二级)']) : null,
    SupplierCode: null,
    LifeStage: null,
    Instructions: null,
    Bidding: null,
    UnitPrice: null,
    TotalUnitPrice: null,
    PaymentClause: null,
    ImportantGrade: null,
    Brand: null,
    BusinessUnit: null,
    SupplierApprovalOpinion: null,
    ComplianceApprovalOpinion: null,
    RegionalManager: null,
    ApprovalOpinion: null,
    ComplianceApprovalOpinionSOSP: null,
    SupplierApprovalOpinionSOSP: null,
    BusinessUnitSOSP: null,
    Control: null,
    ApprovalNotes: null,
    ApprovalRemarks: null,
    SupplierSignatory_ApprovalRemark: null,
    SupplierSignatory_ApprovalNotes: null,
    ComplianceDepartment_ApprovalRemark: null,
    ComplianceDepartment_ApprovalNotes: null,
    ProvincialManagerApprover_ApprovalRe: null,
    ProvincialManagerApprover_ApprovalNotes: null,
    attachments: [],
    MarketPriceWithTax: null,
    WithoutMarketPriceReason: null,
    MainProductGroupNew: null,
  }));

  if (
    targetList.every((v) =>
      Object.keys(v)
        .filter((v) => v !== 'frontKey' && v !== 'attachments')
        .every((item) => !v[item as keyof typeof v])
    )
  )
    return showToast('导入模板错误', 'error');

  currentRow!.osdList.push(...targetList);
  showToast('导入成功', 'success');

  dialogVisible.value = false;
};

const uploadDialogVisible = ref(false);
const uploadRecordId = ref('');
const fileList = ref<{ Id: string; Name: string }[]>([]);

let isEdit: boolean;

const back = () => {
  window.parent.close();
  navigateBack();
};

enum IsApproval {
  '暂存' = '暂存',
  '提交' = '提交',
}
const submit = async (isApproval: IsApproval) => {
  if (isApproval === IsApproval['提交'] && (!form.value.os.Id || isEdit))
    return showToast('请先暂存后再提交', 'error');
  if (form.value.bidSectionList.some((v) => v.osdList.length === 0))
    return showToast('请添加非推荐供应商选用明细', 'error');
  const MainProductGroupNew = [
    ...new Set(
      form.value.bidSectionList
        .map((v) =>
          v.SelectedContractReview.map(
            (link) =>
              prop.value.ContractReview.find((cr) => cr.value === link)
                ?.MainProductGroup
          )
        )
        .flat()
        .filter(Boolean)
    ),
  ];
  if (
    (form.value.os.NegotiatedBiddingProject !== '是' &&
      [...new Set(form.value.bidSectionList.map((v) => v.MainProductGroupNew))]
        .length > 1) ||
    (form.value.os.NegotiatedBiddingProject === '是' &&
      MainProductGroupNew.length > 1)
  )
    return showToast('不同主责事业部不允许发起非推荐供应商选用决策', 'error');

  await formRef.value!.validate();
  const loading = ElLoading.service();
  const updata = {
    ...form.value,
    os: {
      ...form.value.os,
      ContractReviewPageId: contractReviewPageId || form.value.os.ContractReviewPageId,
      SelectContractReviewId: form.value.os.SelectContractReviewId,
      SelectQuatationId: form.value.os.SelectQuatationId,
    },
    bidSectionList: form.value.bidSectionList.map((v) => ({
      ...v,
      osdList: v.osdList.map((item) => ({
        ...item,
        PackageCollectionId: v.SelectedBidPackages.map(
          (ele) => ele.PackageId
        ).join(','),
        MainProductGroupNew: MainProductGroupNew[0] ?? null,
      })),
    })),
  };
  const [e, r] = await (isApproval === IsApproval['提交']
    ? upsertOutsourcingApplicationDetail(updata, true)
    : upsertOutsourcingApplicationDetail(updata, false));
  loading.close();
  if (e) return console.error(e);

  if (r!.IsSuccess) {
    if (isApproval === IsApproval['提交']) {
      showToast('提交成功', 'success');
      // navigateToSObject(form.value.os.Id!)
      window.parent.location.href = toDetail(form.value.os.Id!);
    } else {
      showToast('保存成功', 'success');
      if (config.isDevelopment) {
        router.replace({
          name: 'OutsourcingApplications',
          query: {
            recordId: r!.data?.[0] ?? form.value.os.Id,
            type: Type['Edit'],
          },
        });
        window.location.reload();
      } else {
        window.parent.location.replace(
          `/apex/SellPointMatchingDecisionEdit?id=${r!.data?.[0] ?? form.value.os.Id}&isdtp=p1`
        );
      }
    }
  }
};

/**
 * 审批
 */
const approvalOpinion = {
  [Role['业务单元']]: { select: 'BusinessUnit', input: 'BusinessUnitSOSP' },
  [Role['业务单元加签人']]: {
    select: 'ApprovalRemarks',
    input: 'ApprovalNotes',
  },
  [Role['供应商']]: {
    select: 'SupplierApprovalOpinion',
    input: 'SupplierApprovalOpinionSOSP',
  },
  [Role['供应商加签人']]: {
    select: 'SupplierSignatory_ApprovalRemark',
    input: 'SupplierSignatory_ApprovalNotes',
  },
  [Role['合规']]: {
    select: 'ComplianceApprovalOpinion',
    input: 'ComplianceApprovalOpinionSOSP',
  },
  [Role['合规加签人']]: {
    select: 'ComplianceDepartment_ApprovalRemark',
    input: 'ComplianceDepartment_ApprovalNotes',
  },
  [Role['省区经理']]: { select: 'RegionalManager', input: 'ApprovalOpinion' },
  [Role['省区经理加签人']]: {
    select: 'ProvincialManagerApprover_ApprovalRe',
    input: 'ProvincialManagerApprover_ApprovalNotes',
  },
} as const;
enum Approval {
  '同意' = '同意',
  '拒绝' = '拒绝',
  '有条件同意' = '有条件同意',
}
const handleApproval = (approval: Approval) => {
  const rows = form.value.bidSectionList
    .map((v) => v.osdList)
    .flat()
    .filter((v) => v.checked);
  if (!rows.length) return showToast('请勾选行', 'error');
  let prop:
    | 'BusinessUnit'
    | 'SupplierApprovalOpinion'
    | 'ComplianceApprovalOpinion'
    | 'RegionalManager'
    | 'ApprovalRemarks'
    | 'SupplierSignatory_ApprovalRemark'
    | 'ComplianceDepartment_ApprovalRemark'
    | 'ProvincialManagerApprover_ApprovalRe'
    | '' = '';
  switch (role.value) {
    case Role['业务单元']:
      prop = 'BusinessUnit';
      break;
    case Role['业务单元加签人']:
      prop = 'ApprovalRemarks';
      break;
    case Role['供应商']:
      prop = 'SupplierApprovalOpinion';
      break;
    case Role['供应商加签人']:
      prop = 'SupplierSignatory_ApprovalRemark';
      break;
    case Role['合规']:
      prop = 'ComplianceApprovalOpinion';
      break;
    case Role['合规加签人']:
      prop = 'ComplianceDepartment_ApprovalRemark';
      break;
    case Role['省区经理']:
      prop = 'RegionalManager';
      break;
    case Role['省区经理加签人']:
      prop = 'ProvincialManagerApprover_ApprovalRe';
      break;
  }
  if (!prop) return;

  for (const row of rows) {
    row[prop] = approval;
  }
};

const handleApprovalText = async () => {
  const rows = form.value.bidSectionList
    .map((v) => v.osdList)
    .flat()
    .filter((v) => v.checked);
  if (!rows.length) return showToast('请勾选行', 'error');
  // const { value } = await ElMessageBox.prompt('请输入意见补充说明', '提示', { inputType: 'textarea' })
  const value = ref(rows[0][approvalOpinion[role.value!].input] ?? '');
  ElMessageBox({
    title: '请输入意见补充说明',
    customStyle: {
      width: '100%',
    },
    message: () => (
      <el-input
        v-model={value.value}
        type="textarea"
        show-word-limit
        maxlength="500"
      />
    ),
    beforeClose: (action, _instance, done) => {
      if (action === 'confirm') {
        if (!value.value) return showToast('请输入意见补充说明', 'error');
        for (const row of rows) {
          row[approvalOpinion[role.value!].input] = value.value;
        }
      }
      done();
    },
  });
};

// const approval = async () => {
//   await formRef.value!.validate();
//   const loading = ElLoading.service();
//   const [e] = await saveApproval(recordId, form.value);
//   loading.close();
//   if (e) return console.error(e);
//   showToast('审批成功', 'success');

//   setTimeout(() => {
//     window.parent.close();
//     navigateBack();
//   }, 1000);
// };

enum apostilleType {
  '加签' = '加签',
  '转办' = '转办',
}
// 加签
const apostilleValue = ref('');
const apostille = async (type: apostilleType) => {
  await ElMessageBox({
    title: `选择${type}人`,
    message: () => {
      const list = ref<{ Name: string; Id: string }[]>([]);
      const loading = ref(false);
      const remoteMethod = async (query: string) => {
        if (query) {
          loading.value = true;
          const [e, r] = await searchFromUser(query);
          loading.value = false;
          if (e) return console.error(e);
          console.log(r);
          list.value = r!;
        } else {
          list.value = [];
        }
      };
      return h(ElForm, { labelWidth: '100px' }, () =>
        h(ElFormItem, { label: `${type}人` }, () =>
          h(
            ElSelect,
            {
              modelValue: apostilleValue.value,
              'onUpdate:modelValue': (value) => (apostilleValue.value = value),
              filterable: true,
              remote: true,
              remoteShowSuffix: true,
              remoteMethod,
              loading: loading.value,
            },
            () =>
              list.value.map((v) =>
                h(ElOption, {
                  label: v.Name,
                  value: v.Id,
                  key: v.Id,
                })
              )
          )
        )
      );
    },
    beforeClose: async (action, _instance, done) => {
      if (action === 'confirm') {
        if (!apostilleValue.value) return showToast(`请选择${type}人`, 'error');
        const save =
          type === apostilleType['加签']
            ? saveExtraApprover
            : saveTransApprover;
        const loading = ElLoading.service();
        const [e, r] = await save(
          form.value.os.Id!,
          role.value!,
          apostilleValue.value
        );
        loading.close();
        console.log(r);
        if (e) return console.error(e);
        showToast(`${type}成功`, 'success');
        done();
        apostilleValue.value = '';

        setTimeout(() => {
          if (type === apostilleType['转办']) {
            window.parent.close();
            window.parent.location.href = toDetail(form.value.os.Id!);
          } else {
            window.location.reload();
          }
        }, 1000);
      } else {
        done();
        apostilleValue.value = '';
      }
    },
  });
};

const getBidInfo = async () => {
  const loading = ElLoading.service();
  const [e, r] = await searchSection(bidSectionId, null);
  loading.close();
  if (e) return console.error(e);

  console.log(r);
  form.value = {
    opp: {
      Id: r!.opp.Id,
      Name: r!.opp.Name,
      opportunityNumber__c: r!.opp.opportunityNumber__c ?? '',
      province__c: r!.opp.province__c,
    },
    os: {
      ...r!.os,
      ProjectStage: '投标/议标阶段',
      Source: '手工创建',
      NegotiatedBiddingProject: '否',
      ContractReviewPageId: contractReviewPageId,
    },
    bidSectionList: [],
  };
  prop.value = r!.prop;
  allBidSectionList.value = r!.bidSectionList;

  newBidPackage();
};

const getEditInfo = async () => {
  const loading = ElLoading.service();
  const [e, r] = await buildAllData(recordId);
  loading.close();
  if (e) {
    console.error(e);
    throw e;
  }
  console.log("开始");
  console.log(r!.opp.Id);
  console.log(r);
  form.value = {
    opp: {
      Id: r!.opp.Id,
      Name: r!.opp.Name,
      opportunityNumber__c: r!.opp.opportunityNumber__c ?? '',
      province__c: r!.opp.province__c,
    },
    os: r!.os,
    bidSectionList: r!.bidSectionList.map((v) => ({
      ...v,
      frontKey: String(genFileId()),
      AllBidPackages: v.AllBidPackages,
      SelectedBidPackages: v.SelectedBidPackages,
      SelectedContractReview: v.SelectedContractReview || [],
      bidSectionList: v.Id
        ? [
          {
            Id: v.Id!,
            Name: v.Name!,
            EstimatedBidTime: v.EstimatedBidTime,
            SelectedBidPackages: [],
            osdList: [],
            AllBidPackages: [],
            MainProductGroupNew: v.MainProductGroupNew,
          },
        ]
        : [],
      osdList: v.osdList.map((item) => ({
        frontKey: String(genFileId()),
        checked: false,
        Id: null,
        ...item,
      })),
      tableCheckedAll: false,
    })),
  };
  prop.value = r!.prop;
  allBidSectionList.value = r!.bidSectionList;
  if (r!.currentRole) role.value = r!.currentRole;
  auth.value = r!.type;
  extraType.value = r!.extraType;
  transType.value = r!.transType;
  attachmentType.value = r!.attachmentType;
  transFrExtraType.value = r!.transFrExtraType;
  title.value = r!.applicationLevel;
};

const approvalUrl = ref('');
// const getApproval = async () => {
//   const loading = ElLoading.service();
//   const [e, r] = await getApprovalRedirectUrl(recordId);
//   loading.close();
//   if (e) return console.error(e);
//   console.log(r);
//   if (r!.IsSuccess) {
//     // window.open(r!.data, '_blank')
//     approvalUrl.value = '';
//   } else {
//     showToast(r!.Message, 'error');
//   }
// };

if (type === Type.New) {
  getBidInfo();
} else {
  getEditInfo()
    .then(() => searchSection(form.value.opp.Id, null))
    .then(([e, r]) => {
      if (e) return console.error(e);
      allBidSectionList.value = r!.bidSectionList;

      // 修改值过后需要暂存后再提交
      if (!isApproval) {
        watch(
          form,
          () => {
            isEdit = true;
          },
          { deep: true }
        );
      }
    });

  // if (isApproval && auth.value !== 'read') getApproval();
};

const getLevel2Options = (level1: string | null) => {
  if (!level1) return []
  return categoryMap[level1] || []
};

const handleProductTypeChange = (row: any) => {
  if (row.ProductType && taxRateMap[row.ProductType]) {
    row.TaxRate = taxRateMap[row.ProductType][0]
  }
};
const handleBidPackageChange = (row: any) => {
  if (row.SelectedBidPackages && row.SelectedBidPackages.length > 1) {
    row.SelectedBidPackages = [row.SelectedBidPackages[row.SelectedBidPackages.length - 1]];
  }
  console.log(row.SelectedBidPackages);
  if (row.SelectedBidPackages && row.SelectedBidPackages.length === 1) {
    const selectedPackage = row.SelectedBidPackages[0];

    row.ContractReviewId = selectedPackage.ContractReviewId || '';

    form.value.os.SelectContractReviewId = selectedPackage.ContractReviewId;
    form.value.os.SelectQuatationId = selectedPackage.QuatationId;

    console.log(selectedPackage.ContractReviewId);
    console.log(selectedPackage.QuatationId);

  }
};
const handleContractReviewChange = (row: any) => {
  if (row.SelectedContractReview && row.SelectedContractReview.length > 1) {
    row.SelectedContractReview = [row.SelectedContractReview[row.SelectedContractReview.length - 1]];
  }
  if (row.SelectedBidPackages && row.SelectedBidPackages.length === 1) {
    const SelectedContractReviewDetail = row.SelectedContractReview[0];

    form.value.os.SelectContractReviewId = SelectedContractReviewDetail.ContractReviewId;

    console.log(SelectedContractReviewDetail.ContractReviewId);

  }
};


</script>

<style scoped>
.bid-table :deep(.el-form-item--small) {
  margin-bottom: 0;
}

:deep(.whitespace-pre-line .cell) {
  white-space: pre-line;
}

:deep(thead .cell) {
  color: #606266;
}

:global(.el-message-box__message) {
  flex: 1;
}
</style>