package com.kidstube.service;

import com.kidstube.domain.dto.response.CategoryResponse;
import com.kidstube.domain.entity.Category;
import com.kidstube.repository.CategoryRepository;
import com.kidstube.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final VideoRepository videoRepository;

    public CategoryService(CategoryRepository categoryRepository, VideoRepository videoRepository) {
        this.categoryRepository = categoryRepository;
        this.videoRepository = videoRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc();
        return categories.stream()
                .map(cat -> new CategoryResponse(
                        cat.getId(),
                        cat.getName(),
                        cat.getIconUrl(),
                        cat.getDisplayOrder(),
                        videoRepository.countByCategoryId(cat.getId())
                ))
                .toList();
    }
}
