package com.personalsite.service;

import com.personalsite.vo.SiteConfigVO;
import java.util.Map;

public interface SiteConfigService {
    SiteConfigVO getAllConfigs();
    void updateConfigs(Map<String, String> configs);
}
