<template>
  <div class="clock-container">
    <!-- 展开状态显示模拟时钟 -->
    <template v-if="!isCollapse">
      <div class="analog-clock">
        <div class="clock-face">
          <!-- 刻度 -->
          <div v-for="n in 60" :key="n" class="time-marker" :style="getMarkerStyle(n)">
            <div class="marker" :class="{ 'hour-marker': n % 5 === 0 }"></div>
          </div>
          <!-- 指针 -->
          <div class="hand hour" :style="hourHandStyle"></div>
          <div class="hand minute" :style="minuteHandStyle"></div>
          <div class="hand second" :style="secondHandStyle"></div>
          <div class="center-dot"></div>
        </div>
        <div class="digital-time">
          <div class="date">
            {{ dateStr }} {{ weekDay }}
          </div>
          <div class="lunar-info">
            <div class="lunar-line">
              <span class="lunar-date">{{ lunarDate }}</span>
              <span class="lunar-year">{{ lunarYear }}</span>
              <span class="zodiac">{{ zodiac }}</span>
            </div>
            <div class="festival-line" v-if="festivals.length">
              <el-tag v-for="fest in festivals" :key="fest" size="small" effect="plain">
                {{ fest }}
              </el-tag>
            </div>
            <div class="solar-term-line" v-if="solarTerm">
              <el-tag type="warning" size="small" effect="plain">{{ solarTerm }}</el-tag>
            </div>
          </div>
          <div class="time">{{ timeStr }}</div>
          <div class="extra-info">
            <!-- 星座运势 -->
            <el-popover
              placement="top"
              trigger="hover"
              :width="240"
              popper-class="fortune-popover"
            >
              <template #reference>
                <div class="constellation-wrapper">
                  <el-icon class="constellation-icon">
                    <component :is="constellationIcon" />
                  </el-icon>
                  <span class="constellation">{{ constellation }}</span>
                </div>
              </template>
              <div class="constellation-fortune">
                <div class="fortune-title">今日运势</div>
                <div class="fortune-item">
                  <span class="label">综合运势</span>
                  <el-rate
                    v-model="fortuneData.overall"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <div class="fortune-item">
                  <span class="label">事业学业</span>
                  <el-rate
                    v-model="fortuneData.career"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <div class="fortune-item">
                  <span class="label">爱情运势</span>
                  <el-rate
                    v-model="fortuneData.love"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <div class="fortune-tips">
                  <div class="tips-title">今日提醒</div>
                  <div class="tips-content">{{ fortuneData.tips }}</div>
                </div>
              </div>
            </el-popover>

            <!-- 今日宜忌 -->
            <el-popover
              placement="top"
              trigger="hover"
              :width="200"
              popper-class="advice-popover"
            >
              <template #reference>
                <el-tag size="small" effect="plain" class="daily-tag">今日宜忌</el-tag>
              </template>
              <div class="daily-advice">
                <div class="suitable">
                  <div class="title">宜</div>
                  <div class="content">{{ suitable }}</div>
                </div>
                <div class="unsuitable">
                  <div class="title">忌</div>
                  <div class="content">{{ unsuitable }}</div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
    </template>
    <!-- 收起状态只显示数字时间 -->
    <template v-else>
      <div class="collapsed-time">
        <div class="time">{{ timeStr }}</div>
        <div class="date">{{ dateOnlyStr }}</div>
        <div class="lunar-simple">
          {{ simpleLunarInfo }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import dayjs from 'dayjs'
import { Lunar, Solar } from 'lunar-javascript' // 需要安装 lunar-javascript
import { Calendar, Sunny, Moon, Star } from '@element-plus/icons-vue'

const props = defineProps<{
  isCollapse: boolean
}>()

const now = ref(new Date())
let timer: number

// 更新时间
const updateTime = () => {
  now.value = new Date()
  timer = requestAnimationFrame(updateTime)
}

// 计算指针角度
const hourHandStyle = computed(() => {
  const hours = now.value.getHours() % 12
  const minutes = now.value.getMinutes()
  const degree = (hours + minutes / 60) * 30
  return { transform: `rotate(${degree}deg)` }
})

const minuteHandStyle = computed(() => {
  const minutes = now.value.getMinutes()
  const seconds = now.value.getSeconds()
  const degree = (minutes + seconds / 60) * 6
  return { transform: `rotate(${degree}deg)` }
})

const secondHandStyle = computed(() => {
  const seconds = now.value.getSeconds()
  const milliseconds = now.value.getMilliseconds()
  const degree = (seconds + milliseconds / 1000) * 6
  return { transform: `rotate(${degree}deg)` }
})

// 计算刻度位置
const getMarkerStyle = (n: number) => {
  const degree = (n - 1) * 6
  return { transform: `rotate(${degree}deg)` }
}

// 格式化时间字符串
const dateStr = computed(() => {
  return dayjs(now.value).format('YYYY-MM-DD')
})

const timeStr = computed(() => {
  return dayjs(now.value).format('HH:mm:ss')
})

const dateOnlyStr = computed(() => {
  return dayjs(now.value).format('MM-DD')
})

// 农历日期
const lunarDate = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
})

// 节气
const solarTerm = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  const term = lunar.getJieQi()
  return term || ''
})

// 农历年份和生肖
const lunarYear = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return `${lunar.getYearInGanZhi()}年`
})

const zodiac = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return `${lunar.getYearShengXiao()}年`
})

// 节日信息
const festivals = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  const solar = Solar.fromDate(now.value)
  const festivals = []
  
  // 农历节日
  const lunarFest = lunar.getFestivals()
  if (lunarFest.length) festivals.push(...lunarFest)
  
  // 公历节日
  const solarFest = solar.getFestivals()
  if (solarFest.length) festivals.push(...solarFest)
  
  return festivals
})

// 获取星座
const getConstellation = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const constellations = [
    { name: '水瓶座', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { name: '双鱼座', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { name: '白羊座', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { name: '金牛座', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { name: '双子座', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
    { name: '巨蟹座', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
    { name: '狮子座', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { name: '处女座', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { name: '天秤座', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
    { name: '天蝎座', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
    { name: '射手座', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
    { name: '摩羯座', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 }
  ]

  for (const constellation of constellations) {
    if (
      (month === constellation.startMonth && day >= constellation.startDay) ||
      (month === constellation.endMonth && day <= constellation.endDay)
    ) {
      return constellation.name
    }
  }
  
  return '摩羯座' // 默认返回
}

// 星座
const constellation = computed(() => {
  return getConstellation(now.value)
})

// 宜忌
const suitable = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return lunar.getDayYi().slice(0, 3).join('、')
})

const unsuitable = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return lunar.getDayJi().slice(0, 3).join('、')
})

// 收起状态显示的简化农历
const simpleLunar = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return lunar.getDayInChinese()
})

// 收起状态的简化信息
const simpleLunarInfo = computed(() => {
  const lunar = Lunar.fromDate(now.value)
  return `${lunar.getDayInChinese()}/${lunar.getYearShengXiao()}`
})

// 星座图标映射
const constellationIcons = {
  '水瓶座': Calendar,
  '双鱼座': Moon,
  '白羊座': Star,
  '金牛座': Calendar,
  '双子座': Star,
  '巨蟹座': Moon,
  '狮子座': Sunny,
  '处女座': Star,
  '天秤座': Calendar,
  '天蝎座': Moon,
  '射手座': Star,
  '摩羯座': Calendar
}

// 获取当前星座图标
const constellationIcon = computed(() => {
  return constellationIcons[getConstellation(now.value)]
})

// 星期几
const weekDay = computed(() => {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[now.value.getDay()]
})

// 模拟运势数据（实际项目中可以从API获取）
const fortuneData = reactive({
  overall: 4.5,
  career: 4.0,
  love: 3.5,
  tips: '今天适合沉淀自我，反思过往，静待花开。注意休息，保持良好心态。'
})

onMounted(() => {
  timer = requestAnimationFrame(updateTime)
})

onUnmounted(() => {
  cancelAnimationFrame(timer)
})
</script>

<style lang="scss" scoped>
.clock-container {
  padding: 16px;
  color: #bfcbd9;
  text-align: center;
}

.analog-clock {
  .clock-face {
    width: 160px;
    height: 160px;
    border: 2px solid rgba(191, 203, 217, 0.2);
    border-radius: 50%;
    margin: 0 auto;
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.3);
    
    .time-marker {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      
      .marker {
        position: absolute;
        left: 50%;
        top: 2px;
        width: 1px;
        height: 6px;
        background: rgba(191, 203, 217, 0.3);
        margin-left: -0.5px;
        
        &.hour-marker {
          height: 10px;
          width: 2px;
          background: rgba(191, 203, 217, 0.8);
          margin-left: -1px;
        }
      }
    }

    .hand {
      position: absolute;
      bottom: 50%;
      left: 50%;
      transform-origin: bottom;
      border-radius: 4px;
      
      &.hour {
        width: 4px;
        height: 45px;
        margin-left: -2px;
        background: linear-gradient(to top, #bfcbd9, rgba(191, 203, 217, 0.5));
      }
      
      &.minute {
        width: 3px;
        height: 60px;
        margin-left: -1.5px;
        background: linear-gradient(to top, #409EFF, rgba(64, 158, 255, 0.5));
      }
      
      &.second {
        width: 2px;
        height: 70px;
        margin-left: -1px;
        background: linear-gradient(to top, #F56C6C, rgba(245, 108, 108, 0.5));
      }
    }

    .center-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      margin: -5px 0 0 -5px;
      background: #bfcbd9;
      border-radius: 50%;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
  }

  .digital-time {
    margin-top: 16px;
    font-family: 'Monaco', monospace;
    
    .date {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    
    .lunar-info {
      margin: 8px 0;
      
      .lunar-line {
        font-size: 12px;
        color: #e6a23c;
        margin-bottom: 4px;
        
        > span {
          margin: 0 4px;
        }
      }
      
      .festival-line {
        margin-bottom: 4px;
        
        .el-tag {
          margin: 0 4px;
          font-size: 11px;
        }
      }
      
      .solar-term-line {
        margin-bottom: 4px;
      }
    }
    
    .time {
      font-size: 18px;
      font-weight: 500;
    }
    
    .extra-info {
      margin-top: 8px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      
      .constellation-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: rgba(103, 194, 58, 0.1);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: rgba(103, 194, 58, 0.2);
        }
        
        .constellation-icon {
          font-size: 14px;
          color: #67c23a;
        }
        
        .constellation {
          color: #67c23a;
        }
      }
      
      .daily-tag {
        transition: all 0.3s;
        
        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
        }
      }
    }
  }
}

.constellation-fortune {
  padding: 12px;
  
  .fortune-title {
    font-size: 14px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 12px;
    text-align: center;
  }
  
  .fortune-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .label {
      width: 60px;
      color: #606266;
      font-size: 12px;
    }
  }
  
  .fortune-tips {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    
    .tips-title {
      font-size: 12px;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .tips-content {
      font-size: 12px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.daily-advice {
  padding: 12px;
  
  .suitable, .unsuitable {
    margin-bottom: 12px;
    
    .title {
      font-weight: bold;
      margin-bottom: 6px;
      font-size: 14px;
    }
    
    .content {
      color: #606266;
      font-size: 12px;
      line-height: 1.6;
    }
  }
  
  .suitable .title {
    color: #67c23a;
  }
  
  .unsuitable .title {
    color: #f56c6c;
  }

  .suitable:last-child,
  .unsuitable:last-child {
    margin-bottom: 0;
  }
}

.collapsed-time {
  font-family: 'Monaco', monospace;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  
  .time {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .date {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    &::after {
      content: attr(data-week);
      font-size: 11px;
      opacity: 0.9;
    }
  }

  .lunar-simple {
    font-size: 12px;
    color: #e6a23c;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
}

// 添加全局样式
:global(.advice-popover) {
  z-index: 2001;
}

:global(.fortune-popover) {
  z-index: 2000;
}
</style> 