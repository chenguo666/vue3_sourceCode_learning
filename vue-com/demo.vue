<!-- <!--
 * @Description  :  
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\vue-com\demo.vue
 * @Date         : 2023-01-03 10:05:30
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-03 13:34:30
-->
<template>
  <el-collapse class="mb-6">
    <el-collapse-item title="筛选条件" name="1">
      <el-form label-position="left" label-width="90px" :model="filterOption">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <el-form-item label="用户名">
              <el-input
                v-model="filterOption.name"
                placeholder="筛选指定签名名称"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <el-form-item label="注册时间">
              <el-date-picker
                v-model="filterOption.timeRange"
                type="daterange"
                unlink-panels
                range-separator="到"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-row class="flex mt-4">
              <el-button type="primary" @click="filter">筛选</el-button>
              <el-button type="primary" @click="reset">重置</el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
    </el-collapse-item>
  </el-collapse>
  <el-table v-loading="loading" :data="list" border style="width: 100%">
    <el-table-column label="用户名" min-width="110px">
      <template #default="scope">
        {{ scope.row.name }}
      </template>
    </el-table-column>
    <el-table-column label="手机号码" min-width="130px">
      <template #default="scope">
        {{ scope.row.mobile || "未绑定手机号码" }}
      </template>
    </el-table-column>
    <el-table-column label="邮箱地址" min-width="130px">
      <template #default="scope">
        {{ scope.row.email || "未绑定邮箱地址" }}
      </template>
    </el-table-column>
    <el-table-column prop="createAt" label="注册时间" min-width="220px" />
    <el-table-column width="200px" fixed="right" label="操作">
      <template #default="scope">
        <el-button type="primary" link @click="detail(scope.row)"
          >详情</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <div v-if="total > 0" class="flex justify-end mt-4">
    <el-pagination
      v-model:current-page="curPage"
      v-model:page-size="pageSize"
      background
      layout="sizes, prev, pager, next"
      :total="total"
      :page-sizes="[10, 30, 50]"
    />
  </div>
</template>
<script setup lang="ts">
// import { UserInfoApi } from "@/network/api/User";
// import useList from "./index";
// import { ref } from "vue";
// const filterOption = ref<UserInfoApi.FilterOptionType>({});
// const {
//   list,
//   loading,
//   reset,
//   filter,
//   curPage,
//   pageSize,
//   reload,
//   total,
//   loadData,
// } = useList<UserInfoApi.UserInfo[], UserInfoApi.FilterOptionType>(
//   UserInfoApi.list,
//   filterOption
// );
</script>
