package com.personalsite.service;

import com.personalsite.vo.KbDocumentVO;
import java.util.List;

public interface KbDocumentService {
    List<KbDocumentVO> getDocumentTree(Long projectId);
    KbDocumentVO getDocumentDetail(Long projectId, String slug);
    void updateDocumentContent(Long documentId, String content, String contentZh);
    void translateDocument(Long documentId);
    void translateAllDocuments(Long projectId);
}
