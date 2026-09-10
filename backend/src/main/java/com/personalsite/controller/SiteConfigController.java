package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.service.SiteConfigService;
import com.personalsite.vo.SiteConfigVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/site")
@RequiredArgsConstructor
public class SiteConfigController {

    private final SiteConfigService siteConfigService;

    @GetMapping("/config")
    public Result<SiteConfigVO> getConfig() {
        return Result.ok(siteConfigService.getAllConfigs());
    }

    @PutMapping("/config")
    public Result<Void> updateConfig(@RequestBody Map<String, String> configs) {
        siteConfigService.updateConfigs(configs);
        return Result.ok();
    }
}
