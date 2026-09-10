package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.entity.SiteConfig;
import com.personalsite.mapper.SiteConfigMapper;
import com.personalsite.service.SiteConfigService;
import com.personalsite.vo.SiteConfigVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteConfigServiceImpl implements SiteConfigService {

    private final SiteConfigMapper siteConfigMapper;

    @Override
    public SiteConfigVO getAllConfigs() {
        List<SiteConfig> configs = siteConfigMapper.selectList(null);
        Map<String, String> map = configs.stream()
                .collect(Collectors.toMap(SiteConfig::getConfigKey, SiteConfig::getConfigValue));
        SiteConfigVO vo = new SiteConfigVO();
        vo.setConfigs(map);
        return vo;
    }

    @Override
    public void updateConfigs(Map<String, String> configs) {
        configs.forEach((key, value) -> {
            SiteConfig existing = siteConfigMapper.selectOne(
                    new LambdaQueryWrapper<SiteConfig>().eq(SiteConfig::getConfigKey, key));
            if (existing != null) {
                existing.setConfigValue(value);
                siteConfigMapper.updateById(existing);
            }
        });
    }
}
